import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle, Trash2 } from 'lucide-react';
import axios from '../../plugin/axios'; // Import your configured axios instance

// QuotationItem interface
interface QuotationItemForm {
    id: string;
    name: string;      // Changed from 'description' to match API
    description: string; // Keep this for UI
    quantity: number;
    unitPrice: number;  // Will be converted to unit_price for API
    amount: number;
}

// API response interfaces
interface FieldValue {
    id: number;
    value: string;
}

interface EntityCustomField {
    id: number;
    name: string;
    field_type: string;
    is_required: boolean;
    field_values?: FieldValue[];
}

interface EntityResponse {
    id: number;
    name: string;
    entity_type: string;
    email: string;
    mobile_number: string;
    custom_fields: EntityCustomField[];
}

const AddQuotation = () => {
    const { getNextQuotationNumber } = useAppContext();
    const navigate = useNavigate();

    // State variables
    const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
    const [entities, setEntities] = useState<EntityResponse[]>([]);
    const [activeCustomFields, setActiveCustomFields] = useState<EntityCustomField[]>([]);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [validUntil, setValidUntil] = useState<string>("");
    const [status, setStatus] = useState<string>("draft");
    const [notes, setNotes] = useState<string>("");
    const [terms, setTerms] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Items management
    const [items, setItems] = useState<QuotationItemForm[]>([]);
    const [subtotal, setSubtotal] = useState<number>(0);
    const [taxRate, setTaxRate] = useState<number>(10);
    const [tax, setTax] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);

    // Initialize form with a new item
    useEffect(() => {
        addItem();
    }, []);

    // Fetch all entities on component mount
    useEffect(() => {
        const fetchEntities = async () => {
            setLoading(true);
            try {
                const response = await axios.get('/quotation/entities/');
                setEntities(response.data);
            } catch (err) {
                console.error('Error fetching entities:', err);
                setError('Failed to load entities. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        fetchEntities();
    }, []);

    // Fetch entity details when selection changes
    useEffect(() => {
        if (selectedEntityId !== null) {
            fetchEntityDetails(selectedEntityId);
        } else {
            setActiveCustomFields([]);
            setFormValues({});
        }
    }, [selectedEntityId]);

    // Recalculate totals when items change
    useEffect(() => {
        const newSubtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const newTax = (newSubtotal * taxRate) / 100;

        setSubtotal(newSubtotal);
        setTax(newTax);
        setTotal(newSubtotal + newTax);
    }, [items, taxRate]);

    // Fetch entity details including custom fields
    const fetchEntityDetails = async (entityId: number) => {
        setLoading(true);
        setError(null);

        try {
            // Using your pre-configured axios instance from plugin/axios.tsx
            const response = await axios.get(`/quotation/entities/${entityId}`);
            const entityData: EntityResponse = response.data;

            if (entityData.custom_fields) {
                setActiveCustomFields(entityData.custom_fields);

                // Initialize form values for the fields
                const initialValues: Record<string, any> = {};
                entityData.custom_fields.forEach((field) => {
                    // Pre-fill quotation number if a field looks like it's for quotation numbers
                    if (field.name.toLowerCase().includes('quotation number') ||
                        field.name.toLowerCase().includes('invoice number')) {
                        initialValues[field.name] = getNextQuotationNumber();
                    }
                    // Set today's date for date fields
                    else if (field.field_type === 'date' ||
                        field.name.toLowerCase().includes('date') ||
                        field.name.toLowerCase().includes('issue')) {
                        const today = new Date().toISOString().split('T')[0];
                        initialValues[field.name] = today;
                    }
                    // Default values for other types
                    else if ((field.field_type === 'dropdown' || field.field_type === 'radio')
                        && field.field_values && field.field_values.length > 0) {
                        initialValues[field.name] = field.field_values[0].value;
                    }
                    else if (field.field_type === 'checkbox' && field.field_values && field.field_values.length > 0) {
                        // For multi-select checkboxes, initialize with empty array
                        initialValues[field.name] = [];
                    }
                    else if (field.field_type === 'number') {
                        initialValues[field.name] = 0;
                    }
                    else {
                        initialValues[field.name] = '';
                    }
                });

                setFormValues(initialValues);
            }
        } catch (err) {
            console.error('Error fetching entity details:', err);
            setError('Failed to load entity details. Please try again.');
            setActiveCustomFields([]);
        } finally {
            setLoading(false);
        }
    };

    // Handle input changes for custom fields
    const handleInputChange = (fieldName: string, value: string | number | any[]) => {
        setFormValues({
            ...formValues,
            [fieldName]: value
        });
    };

    // Add new item
    const addItem = () => {
        const newItem: QuotationItemForm = {
            id: uuidv4(),
            name: '',        // Add this
            description: '',
            quantity: 1,
            unitPrice: 0,
            amount: 0
        };
        setItems([...items, newItem]);
    };

    // Update item
    // Update item
    const updateItem = (id: string, field: keyof QuotationItemForm, value: string | number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                // Create a new item object with the updated field
                const updatedItem = { ...item, [field]: value };

                // Recalculate amount when quantity or unitPrice changes
                if (field === 'quantity' || field === 'unitPrice') {
                    updatedItem.amount = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
                }

                return updatedItem;
            }
            return item;
        }));
    };

    // Remove item
    const removeItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter(item => item.id !== id));
        }
    };

    // Render field based on type
    // Update the renderField function to handle checkbox type

    // Render field based on type
    const renderField = (field: EntityCustomField) => {
        switch (field.field_type) {
            case 'text':
                return (
                    <Input
                        id={field.name}
                        name={field.name}
                        value={formValues[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.is_required}
                        placeholder={`Enter ${field.name}`}
                        className="text-foreground"
                    />
                );
            case 'number':
                return (
                    <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        value={formValues[field.name] || 0}
                        onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value) || 0)}
                        required={field.is_required}
                        placeholder={`Enter ${field.name}`}
                        className="text-foreground"
                    />
                );
            case 'date':
                return (
                    <Input
                        id={field.name}
                        name={field.name}
                        type="date"
                        value={formValues[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.is_required}
                        className="text-foreground"
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        id={field.name}
                        name={field.name}
                        value={formValues[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.is_required}
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={`Enter ${field.name}`}
                    />
                );
            case 'dropdown':
                return (
                    <select
                        id={field.name}
                        name={field.name}
                        value={formValues[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.is_required}
                        className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Select {field.name}</option>
                        {field.field_values?.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.value}
                            </option>
                        ))}
                    </select>
                );
            case 'radio':
                return (
                    <div className="flex flex-col space-y-2">
                        {field.field_values?.map(option => (
                            <label key={option.value} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    name={field.name}
                                    value={option.value}
                                    checked={formValues[field.name] === option.value}
                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                    required={field.is_required}
                                    className="h-4 w-4 text-primary"
                                />
                                <span className="text-sm text-foreground">{option.value}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'checkbox':
                return (
                    <div className="flex flex-col space-y-2">
                        {field.field_values?.map(option => {
                            // For multiple checkbox selection, store as array
                            const selectedValues = Array.isArray(formValues[field.name])
                                ? formValues[field.name]
                                : formValues[field.name] ? [formValues[field.name]] : [];

                            const isChecked = selectedValues.includes(option.value);

                            return (
                                <label key={option.value} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        name={`${field.name}-${option.value}`}
                                        checked={isChecked}
                                        onChange={() => {
                                            let newValues = [...selectedValues];
                                            if (isChecked) {
                                                // Remove if already selected
                                                newValues = newValues.filter(val => val !== option.value);
                                            } else {
                                                // Add if not selected
                                                newValues.push(option.value);
                                            }
                                            handleInputChange(field.name, newValues);
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-foreground">{option.value}</span>
                                </label>
                            );
                        })}
                    </div>
                );
            default:
                return null;
        }
    };

    // Form submission handler
    // Update your handleSubmit function 
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedEntityId === null) {
            alert('Please select an entity');
            return;
        }

        try {
            setLoading(true);

            // Find quotation number and issue date from custom fields
            let quotationNumber = getNextQuotationNumber();
            let issueDate = new Date().toISOString().split('T')[0];

            // Look for fields with quotation number or date
            activeCustomFields.forEach(field => {
                if (field.name.toLowerCase().includes('quotation number') ||
                    field.name.toLowerCase().includes('invoice number')) {
                    quotationNumber = formValues[field.name] || quotationNumber;
                }
                if (field.field_type === 'date' ||
                    field.name.toLowerCase().includes('date') &&
                    field.name.toLowerCase().includes('issue')) {
                    issueDate = formValues[field.name] || issueDate;
                }
            });

            // Create API-formatted quotation
            const quotationData = {
                quotation_number: quotationNumber,
                issue_date: issueDate,
                valid_until: validUntil || issueDate,
                entity: selectedEntityId, // This is now a number which is what the API expects
                status: status.toLowerCase(),
                items: items.map(item => ({
                    name: item.description, // Using description as name
                    quantity: item.quantity,
                    unit_price: item.unitPrice,
                    amount: item.amount
                })),
                subtotal,
                tax,
                total,
                notes: notes || "",
                terms: terms || "",
                custom_values: formValues
            };

            console.log('Sending quotation data:', JSON.stringify(quotationData, null, 2));

            // Submit to API
            const response = await axios.post('/quotation/', quotationData);
            console.log('API response:', response.data);

            // Show success message
            alert('Quotation created successfully!');

            // Navigate to reports
            navigate('/react-vite-supreme/admin/reports');

        } catch (error: any) {
            console.error('Failed to create quotation:', error);

            if (error.response?.data) {
                const errorDetails = JSON.stringify(error.response.data, null, 2);
                setError(`Failed to create quotation: ${errorDetails}`);
            } else {
                setError('Failed to create quotation. Please check your inputs and try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP'
        }).format(value).replace('PHP', '₱');
    };

    return (
        <div className="bg-card dark:bg-card p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-xl font-medium mb-6 text-foreground">Create New Quotation</h2>

            {error && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form className="space-y-6 max-w-4xl" onSubmit={handleSubmit}>
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-4 text-foreground">Client Information</h3>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="client" className="block text-sm font-medium text-foreground">
                                    Select Entity
                                </label>
                                <select
                                    id="client"
                                    value={selectedEntityId === null ? "" : selectedEntityId}
                                    onChange={(e) => setSelectedEntityId(e.target.value ? parseInt(e.target.value) : null)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                >
                                    <option value="">Select entity</option>
                                    {entities.map(entity => (
                                        <option key={entity.id} value={entity.id}>
                                            {entity.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="py-4 text-center text-muted-foreground">
                                Loading entity details...
                            </div>
                        ) : selectedEntityId && (
                            <div className="space-y-4 mt-4">
                                <h4 className="text-md font-medium text-foreground border-b border-border pb-2">
                                    Quotation Details
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activeCustomFields.map((field) => (
                                        <div key={field.name} className="space-y-2">
                                            <label htmlFor={field.name} className="block text-sm font-medium text-foreground">
                                                {field.name} {field.is_required && <span className="text-red-500">*</span>}
                                            </label>
                                            {renderField(field)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-4 text-foreground">Additional Details</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="validUntil" className="block text-sm font-medium text-foreground">
                                    Valid Until
                                </label>
                                <Input
                                    id="validUntil"
                                    name="validUntil"
                                    type="date"
                                    className="text-foreground"
                                    value={validUntil}
                                    onChange={(e) => setValidUntil(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="status" className="block text-sm font-medium text-foreground">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="pending">Pending</option>
                                    <option value="sent">Sent</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="declined">Declined</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rest of the form (items, notes, etc.) remains unchanged */}

                {/* Items section */}
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-4 text-foreground">Items</h3>

                    <div className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="bg-background p-4 rounded border border-border">
                                <div className="grid grid-cols-12 gap-2">
                                    <div className="col-span-5">
                                        <label className="block text-xs font-medium text-foreground mb-1">
                                            Description
                                        </label>
                                        <Input
                                            placeholder="Item description"
                                            className="text-foreground"
                                            value={item.description}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setItems(items.map(i =>
                                                    i.id === item.id
                                                        ? { ...i, description: value, name: value }
                                                        : i
                                                ));
                                            }}
                                            required
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-foreground mb-1">
                                            Quantity
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className="text-foreground"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-foreground mb-1">
                                            Unit Price
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            className="text-foreground"
                                            value={item.unitPrice}
                                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-foreground mb-1">
                                            Amount
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            className="text-foreground"
                                            value={item.amount}
                                            disabled
                                        />
                                    </div>
                                    <div className="col-span-1 flex items-end">
                                        <Button
                                            variant="outline"
                                            className="text-red-500 w-full"
                                            size="sm"
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            disabled={items.length <= 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Button
                            variant="outline"
                            type="button"
                            size="sm"
                            className="dark:text-white flex items-center"
                            onClick={addItem}
                        >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Add Item
                        </Button>

                        <div className="flex justify-end mt-4">
                            <div className="w-64 space-y-2">
                                <div className="grid grid-cols-3 gap-2 items-center">
                                    <div className="col-span-1 text-foreground text-right">
                                        <label htmlFor="taxRate" className="text-sm">Tax Rate</label>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex items-center">
                                            <Input
                                                id="taxRate"
                                                type="number"
                                                className="text-foreground"
                                                value={taxRate}
                                                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                                                min="0"
                                                max="100"
                                            />
                                            <span className="ml-1">%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-between py-1 text-foreground">
                                    <span>Subtotal:</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between py-1 text-foreground">
                                    <span>Tax ({taxRate}%):</span>
                                    <span>{formatCurrency(tax)}</span>
                                </div>
                                <div className="flex justify-between py-2 font-bold border-t border-border mt-1 text-foreground">
                                    <span>Total:</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes & Terms section */}
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-4 text-foreground">Notes & Terms</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="notes" className="block text-sm font-medium text-foreground">
                                Notes
                            </label>
                            <textarea
                                id="notes"
                                rows={3}
                                className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Add notes for the client"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="terms" className="block text-sm font-medium text-foreground">
                                Terms & Conditions
                            </label>
                            <textarea
                                id="terms"
                                rows={3}
                                className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Terms and conditions for this quotation"
                                value={terms}
                                onChange={(e) => setTerms(e.target.value)}
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={loading}>
                        Save Quotation
                    </Button>
                    <Button type="button" variant="outline" className="dark:text-white" disabled={loading}>
                        Preview
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="ml-auto dark:text-white"
                        onClick={() => navigate('/react-vite-supreme/admin/dashboard')}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddQuotation;