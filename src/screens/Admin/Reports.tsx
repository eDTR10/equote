import { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Button } from '../../components/ui/button';
import { Filter, FileDown, FileUp, Eye } from 'lucide-react';
import { Switch } from "../../components/ui/switch";
import { useAppContext } from '../../context/AppContext';
import axios from '../../plugin/axios';

// Types for entity custom fields
interface FieldValue {
    id: number;
    value: string;
}

interface CustomField {
    id: number;
    name: string;
    field_type: string;
    is_required: boolean;
    is_enabled: boolean;
    field_values: FieldValue[];
}

const Reports = () => {
    const [apiEntities, setApiEntities] = useState<{ id: number, name: string }[]>([]);
    const [apiQuotations, setApiQuotations] = useState<any[]>([]);
    const { updateQuotationPaymentStatus } = useAppContext();
    const [selectedEntityId, setSelectedEntityId] = useState<string>('all');
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingEntities, setIsLoadingEntities] = useState(true); // Start as true to show initial loading
    const [isLoadingQuotations, setIsLoadingQuotations] = useState(true);
    const [paymentToggles, setPaymentToggles] = useState<Record<string, boolean>>({}); // Track the payment toggle states locally

    // Define interfaces for API responses
    interface ApiQuotation {
        id: number;
        quotation_number: string;
        issue_date: string;
        valid_until: string;
        status: string;
        total_amount: number;
        is_paid?: boolean;
        payment_date?: string;
        payment_reference?: string;
        entity: number;
        custom_values?: Record<string, any>;
    }

    // Fetch all entities and quotations on component mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch entities
                const entitiesResponse = await axios.get('/quotation/entities/');
                const fetchedEntities = entitiesResponse.data.map((entity: any) => ({
                    id: entity.id,
                    name: entity.name
                }));
                setApiEntities(fetchedEntities);

                // Fetch all quotations
                const quotationsResponse = await axios.get('/quotation/');
                const fetchedQuotations = quotationsResponse.data;
                setApiQuotations(fetchedQuotations);

                // Initialize payment toggles state based on is_paid property or status="paid"
                const initialToggles: Record<string, boolean> = {};
                fetchedQuotations.forEach((quotation: any) => {
                    // Set toggle on if either is_paid is true OR status is "paid"
                    initialToggles[quotation.id] = Boolean(quotation.is_paid) || quotation.status === "paid";
                });
                setPaymentToggles(initialToggles);
            } catch (error) {
                console.error('Error fetching initial data:', error);
                setApiEntities([]);
                setApiQuotations([]);
            } finally {
                setIsLoadingEntities(false);
                setIsLoadingQuotations(false);
            }
        };

        fetchInitialData();
    }, []);

    // Add "All Entities" option to the entities list
    const entitiesWithAll = [
        { id: 'all', name: 'All Entities' },
        ...apiEntities
    ];

    // Fetch custom fields when entity selection changes
    useEffect(() => {
        if (selectedEntityId && selectedEntityId !== 'all') {
            fetchEntityCustomFields(selectedEntityId);
        } else {
            setCustomFields([]);
        }
    }, [selectedEntityId]);

    // Fetch custom fields for selected entity
    const fetchEntityCustomFields = async (entityId: string) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/quotation/entities/${entityId}`);
            const entityData = response.data;

            if (entityData.custom_fields) {
                // Only include enabled fields
                const enabledFields = entityData.custom_fields.filter(
                    (field: CustomField) => field.is_enabled !== false // Consider undefined as enabled
                );
                setCustomFields(enabledFields);
            } else {
                setCustomFields([]);
            }
        } catch (error) {
            console.error('Error fetching entity custom fields:', error);
            setCustomFields([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP'
        }).format(value).replace('PHP', '₱');
    };

    // Toggle payment status
    const togglePaymentStatus = (quotationId: string, isPaid: boolean) => {
        const today = new Date().toISOString().split('T')[0];
        const paymentRef = `PAYMENT-${new Date().getFullYear()}-${quotationId}`;

        // Update local state immediately for responsive UI
        setPaymentToggles(prev => ({
            ...prev,
            [quotationId]: isPaid
        }));

        // Also update the quotation in the apiQuotations state
        setApiQuotations(prev =>
            prev.map(q =>
                q.id.toString() === quotationId
                    ? {
                        ...q,
                        is_paid: isPaid,
                        status: isPaid ? 'paid' : 'pending', // Update status to "paid" when paid
                        payment_date: isPaid ? today : undefined,
                        payment_reference: isPaid ? paymentRef : undefined
                    }
                    : q
            )
        );

        console.log(`Updating payment status for ${quotationId} to ${isPaid ? 'paid' : 'unpaid'}`);

        // Make the API call
        updateQuotationPaymentStatus(quotationId, {
            isPaid,
            paymentDate: isPaid ? today : undefined,
            paymentReference: isPaid ? paymentRef : undefined
        })
            .then(response => {
                console.log('Payment update successful:', response);
                // Refresh quotations after successful update to get the latest state
                axios.get('/quotation/')
                    .then(response => {
                        setApiQuotations(response.data);

                        // Update toggles from fresh data
                        const refreshedToggles: Record<string, boolean> = {};
                        response.data.forEach((quotation: any) => {
                            refreshedToggles[quotation.id] = Boolean(quotation.is_paid) || quotation.status === "paid";
                        });
                        setPaymentToggles(refreshedToggles);
                    })
                    .catch(err => console.error('Error refreshing quotations:', err));
            })
            .catch(error => {
                // If there's an error, revert the local state
                console.error('Error updating payment status:', error);
                setPaymentToggles(prev => ({
                    ...prev,
                    [quotationId]: !isPaid
                }));
                setApiQuotations(prev =>
                    prev.map(q =>
                        q.id.toString() === quotationId
                            ? {
                                ...q,
                                is_paid: !isPaid,
                                status: !isPaid ? 'paid' : 'pending',
                                payment_date: !isPaid ? today : undefined,
                                payment_reference: !isPaid ? paymentRef : undefined
                            }
                            : q
                    )
                );
            });
    };

    // Get entity name by ID
    const getEntityNameById = (entityId: string) => {
        const entity = apiEntities.find(e => e.id.toString() === entityId);
        return entity ? entity.name : 'Unknown';
    };

    // Format custom field values based on type
    const formatCustomFieldValue = (field: CustomField, value: any) => {
        if (value === undefined || value === null || value === '') return '-';

        switch (field.field_type) {
            case 'date':
                try {
                    return formatDate(value);
                } catch {
                    return value.toString();
                }

            case 'number':
                try {
                    return Number(value).toLocaleString();
                } catch {
                    return value.toString();
                }

            case 'checkbox':
                if (Array.isArray(value)) {
                    // For multi-select checkboxes, display the selected values
                    // Map the values to their display labels if field_values are available
                    if (field.field_values && field.field_values.length > 0) {
                        const selectedLabels = value.map(v => {
                            const fieldValue = field.field_values.find(fv => fv.value === v);
                            return fieldValue ? fieldValue.value : v;
                        });
                        return selectedLabels.join(', ');
                    }
                    return value.join(', ');
                }
                return value === true ? 'Yes' : value === false ? 'No' : value.toString();

            case 'dropdown':
            case 'radio':
                // Map the value to its display label if field_values are available
                if (field.field_values && field.field_values.length > 0) {
                    const fieldValue = field.field_values.find(fv => fv.value === value);
                    return fieldValue ? fieldValue.value : value.toString();
                }
                return value.toString();

            case 'textarea':
            case 'text':
                // Truncate long text values
                const text = value.toString();
                return text.length > 50 ? `${text.substring(0, 50)}...` : text;

            default:
                return value.toString();
        }
    };

    // Filter quotations based on selected entity
    const filteredQuotations = selectedEntityId === 'all'
        ? apiQuotations
        : apiQuotations.filter((q: any) => q.entity.toString() === selectedEntityId);

    return (
        <div className="bg-card dark:bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-foreground">Quotation Reports</h2>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="text-foreground">
                        <FileDown className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm" className="text-foreground">
                        <FileUp className="w-4 h-4 mr-2" />
                        Import
                    </Button>
                </div>
            </div>

            <div className="mb-6 p-4 bg-muted/30 rounded-md border border-border">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center">
                        <Filter className="w-5 h-5 mr-2 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Filter by Entity:</span>
                    </div>
                    {isLoadingEntities ? (
                        <div className="text-sm text-muted-foreground">Loading entities...</div>
                    ) : (
                        <select
                            value={selectedEntityId}
                            onChange={(e) => setSelectedEntityId(e.target.value)}
                            className="bg-background text-foreground rounded-md border border-input px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            {entitiesWithAll.map(entity => (
                                <option key={entity.id} value={entity.id.toString()}>
                                    {entity.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                {isLoading || isLoadingQuotations ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Loading {isLoading ? 'entity details' : 'quotations'}...
                    </div>
                ) : (
                    <Table>
                        <TableCaption>
                            {filteredQuotations.length === 0
                                ? "No quotations found"
                                : `List of quotations ${selectedEntityId !== 'all'
                                    ? `for ${entitiesWithAll.find(e => e.id.toString() === selectedEntityId)?.name}`
                                    : ''}`
                            }
                        </TableCaption>
                        <TableHeader>
                            <TableRow>
                                {/* Standard columns that are always shown */}
                                <TableHead className="whitespace-nowrap">Quotation ID</TableHead>
                                <TableHead className="whitespace-nowrap">Client</TableHead>
                                <TableHead className="whitespace-nowrap">Issue Date</TableHead>
                                <TableHead className="whitespace-nowrap">Valid Until</TableHead>

                                {/* Dynamic columns based on entity custom fields - only shown when a specific entity is selected */}
                                {selectedEntityId !== 'all' && customFields.map(field => (
                                    <TableHead
                                        key={field.id}
                                        className="whitespace-nowrap"
                                        title={`Field Type: ${field.field_type.charAt(0).toUpperCase() + field.field_type.slice(1)}`}
                                    >
                                        <div className="flex items-center gap-1">
                                            {field.name}
                                            {field.is_required &&
                                                <span className="w-1 h-1 rounded-full bg-red-500 inline-block" title="Required field"></span>
                                            }
                                        </div>
                                    </TableHead>
                                ))}

                                {/* Remaining standard columns */}
                                <TableHead className="text-right whitespace-nowrap">Amount</TableHead>
                                <TableHead className="text-center whitespace-nowrap">Status</TableHead>
                                <TableHead className="text-center whitespace-nowrap">Paid</TableHead>
                                <TableHead className="whitespace-nowrap">Payment Date</TableHead>
                                <TableHead className="whitespace-nowrap">Payment Ref</TableHead>
                                <TableHead className="text-center whitespace-nowrap">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredQuotations.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={selectedEntityId !== 'all' ? 11 + customFields.length : 11}
                                        className="text-center py-6 text-muted-foreground"
                                    >
                                        No quotations found for the selected criteria
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredQuotations.map((quotation) => (
                                    <TableRow key={quotation.id}>
                                        {/* Standard columns */}
                                        <TableCell className="font-medium">{quotation.quotation_number}</TableCell>
                                        <TableCell>{getEntityNameById(quotation.entity.toString())}</TableCell>
                                        <TableCell>{formatDate(quotation.issue_date)}</TableCell>
                                        <TableCell>{formatDate(quotation.valid_until)}</TableCell>

                                        {/* Dynamic columns based on entity custom fields */}
                                        {selectedEntityId !== 'all' && customFields.map(field => {
                                            const rawValue = quotation.custom_values ?
                                                quotation.custom_values[field.name] : undefined;
                                            const formattedValue = formatCustomFieldValue(field, rawValue);

                                            // Add tooltip for long text or multiple selected values
                                            const needsTooltip =
                                                (typeof rawValue === 'string' && rawValue.length > 50) ||
                                                (Array.isArray(rawValue) && rawValue.length > 0);

                                            const tooltip = needsTooltip
                                                ? Array.isArray(rawValue)
                                                    ? rawValue.join(', ')
                                                    : typeof rawValue === 'string' ? rawValue : String(rawValue)
                                                : '';

                                            return (
                                                <TableCell
                                                    key={field.id}
                                                    className={needsTooltip ? "cursor-help" : ""}
                                                    title={needsTooltip ? tooltip : undefined}
                                                >
                                                    {formattedValue}
                                                </TableCell>
                                            );
                                        })}

                                        {/* Remaining standard columns */}
                                        <TableCell className="text-right">{formatCurrency(quotation.total_amount)}</TableCell>
                                        <TableCell className="text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${quotation.status === 'approved'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : quotation.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        : quotation.status === 'rejected'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}
                                            >
                                                {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center">
                                                <Switch
                                                    checked={paymentToggles[quotation.id] || quotation.status === "paid" || false}
                                                    onCheckedChange={(checked) => togglePaymentStatus(quotation.id.toString(), checked)}
                                                    className="data-[state=checked]:bg-green-500"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {quotation.payment_date ? formatDate(quotation.payment_date) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {quotation.payment_reference || '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button variant="ghost" size="sm">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
};

export default Reports;