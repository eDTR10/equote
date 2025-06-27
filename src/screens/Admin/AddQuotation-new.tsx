import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAppContext, CustomField } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { PlusCircle, Trash2 } from 'lucide-react';

// QuotationItem interface
interface QuotationItemForm {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

const AddQuotation = () => {
    const { entities, addQuotation, getNextQuotationNumber } = useAppContext();
    const navigate = useNavigate();

    // State variables
    const [selectedEntityId, setSelectedEntityId] = useState<string>("");
    const [activeCustomFields, setActiveCustomFields] = useState<CustomField[]>([]);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [validUntil, setValidUntil] = useState<string>("");
    const [status, setStatus] = useState<string>("draft");
    const [notes, setNotes] = useState<string>("");
    const [terms, setTerms] = useState<string>("");

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

    // Update active fields when entity selection changes
    useEffect(() => {
        if (selectedEntityId) {
            const selectedEntity = entities.find(entity => entity.id === selectedEntityId);
            if (selectedEntity) {
                const enabledFields = selectedEntity.customFields.filter(field => field.enabled);
                setActiveCustomFields(enabledFields);

                // Initialize form values for the fields
                const initialValues: Record<string, any> = {};
                enabledFields.forEach(field => {
                    // Pre-fill quotation number
                    if (field.name === 'Quotation Number') {
                        initialValues[field.id.toString()] = getNextQuotationNumber();
                    } else if (field.name === 'Issue Date') {
                        // Set today's date
                        const today = new Date().toISOString().split('T')[0];
                        initialValues[field.id.toString()] = today;
                    } else {
                        initialValues[field.id.toString()] = field.type === 'number' ? 0 : '';
                    }
                });
                setFormValues(initialValues);
            }
        } else {
            setActiveCustomFields([]);
            setFormValues({});
        }
    }, [selectedEntityId, entities, getNextQuotationNumber]);

    // Recalculate totals when items change
    useEffect(() => {
        const newSubtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const newTax = (newSubtotal * taxRate) / 100;

        setSubtotal(newSubtotal);
        setTax(newTax);
        setTotal(newSubtotal + newTax);
    }, [items, taxRate]);

    // Handle input changes for custom fields
    const handleInputChange = (fieldId: string, value: string | number) => {
        setFormValues({
            ...formValues,
            [fieldId]: value
        });
    };

    // Add new item
    const addItem = () => {
        const newItem: QuotationItemForm = {
            id: uuidv4(),
            description: '',
            quantity: 1,
            unitPrice: 0,
            amount: 0
        };

        setItems([...items, newItem]);
    };

    // Update item
    const updateItem = (id: string, field: keyof QuotationItemForm, value: string | number) => {
        setItems(items.map(item => {
            if (item.id === id) {
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
    const renderField = (field: CustomField) => {
        const fieldId = field.id.toString();

        switch (field.type) {
            case 'text':
                return (
                    <Input
                        id={fieldId}
                        name={fieldId}
                        value={formValues[fieldId] || ''}
                        onChange={(e) => handleInputChange(fieldId, e.target.value)}
                        required={field.required}
                        placeholder={`Enter ${field.name}`}
                        className="text-foreground"
                    />
                );
            case 'number':
                return (
                    <Input
                        id={fieldId}
                        name={fieldId}
                        type="number"
                        value={formValues[fieldId] || 0}
                        onChange={(e) => handleInputChange(fieldId, parseFloat(e.target.value) || 0)}
                        required={field.required}
                        placeholder={`Enter ${field.name}`}
                        className="text-foreground"
                    />
                );
            case 'date':
                return (
                    <Input
                        id={fieldId}
                        name={fieldId}
                        type="date"
                        value={formValues[fieldId] || ''}
                        onChange={(e) => handleInputChange(fieldId, e.target.value)}
                        required={field.required}
                        className="text-foreground"
                    />
                );
            case 'textarea':
                return (
                    <textarea
                        id={fieldId}
                        name={fieldId}
                        value={formValues[fieldId] || ''}
                        onChange={(e) => handleInputChange(fieldId, e.target.value)}
                        required={field.required}
                        rows={3}
                        className="flex w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={`Enter ${field.name}`}
                    />
                );
            case 'select':
                // Example options for select fields - in real app these would be dynamic
                const options = [
                    { value: 'net15', label: 'Net 15 days' },
                    { value: 'net30', label: 'Net 30 days' },
                    { value: 'net60', label: 'Net 60 days' },
                    { value: 'immediate', label: 'Immediate Payment' },
                ];
                return (
                    <select
                        id={fieldId}
                        name={fieldId}
                        value={formValues[fieldId] || ''}
                        onChange={(e) => handleInputChange(fieldId, e.target.value)}
                        required={field.required}
                        className="flex h-10 w-full rounded-md border border-input bg-background text-foreground px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Select {field.name}</option>
                        {options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );
            default:
                return null;
        }
    };

    // Form submission handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedEntityId) {
            alert('Please select an entity');
            return;
        }

        // Find quotation number from custom fields
        let quotationNumber = '';
        activeCustomFields.forEach(field => {
            if (field.name.toLowerCase().includes('quotation number')) {
                quotationNumber = formValues[field.id.toString()] || '';
            }
        });

        // Find issue date from custom fields
        let issueDate = '';
        activeCustomFields.forEach(field => {
            if (field.name.toLowerCase().includes('issue date')) {
                issueDate = formValues[field.id.toString()] || '';
            }
        });

        // Create new quotation
        addQuotation({
            entityId: selectedEntityId,
            quotationNumber,
            issueDate,
            validUntil,
            status: status as any,
            items: items.map(item => ({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.amount
            })),
            subtotal,
            tax,
            total,
            notes,
            terms,
            isPaid: false,
            customValues: formValues
        });

        // Redirect to quotation list
        navigate('/admin/reports');
    };

    // Format currency
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    };

    return (
        <div className="bg-card dark:bg-card p-6 rounded-lg shadow-sm border border-border">
            <h2 className="text-xl font-medium mb-6 text-foreground">Create New Quotation</h2>

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
                                    value={selectedEntityId}
                                    onChange={(e) => setSelectedEntityId(e.target.value)}
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

                        {selectedEntityId && (
                            <div className="space-y-4 mt-4">
                                <h4 className="text-md font-medium text-foreground border-b border-border pb-2">
                                    Quotation Details
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {activeCustomFields.map((field) => (
                                        <div key={field.id} className="space-y-2">
                                            <label htmlFor={field.id.toString()} className="block text-sm font-medium text-foreground">
                                                {field.name} {field.required && <span className="text-red-500">*</span>}
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
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <h3 className="text-lg font-medium mb-4 text-foreground">Items</h3>

                    <div className="space-y-4">
                        {items.map((item, index) => (
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
                                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
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
                    <Button type="submit">
                        Save Quotation
                    </Button>
                    <Button type="button" variant="outline" className="dark:text-white">
                        Preview
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        className="ml-auto dark:text-white"
                        onClick={() => navigate('/admin/dashboard')}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddQuotation;
