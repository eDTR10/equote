import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createEntity } from '../../services/entityService';
import { CustomField as ApiCustomField } from '../../types/entity';
import { CheckedState } from '@radix-ui/react-checkbox';

interface FieldValue {
    id?: number;
    value: string;
}

interface CustomFieldForm {
    id?: number;
    name: string;
    fieldType: 'text' | 'dropdown' | 'radio' | 'textarea' | 'checkbox';
    isRequired: boolean;
    isEnabled: boolean; // Add this property
    fieldValues: FieldValue[];
}

// Define available field types for custom fields
const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'radio', label: 'Radio' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'checkbox', label: 'Checkbox' }
];

const AddEntity = () => {
    const navigate = useNavigate();

    // State for entity form
    const [entityName, setEntityName] = useState('');
    const [entityType, setEntityType] = useState('company');
    const [entityEmail, setEntityEmail] = useState('');
    const [entityPhone, setEntityPhone] = useState('');
    const [entityAddress, setEntityAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Example entity data for quick testing
    const exampleEntityData = {
        name: "Acme Corporation",
        entity_type: "company",
        email: "contact@acme.com",
        mobile_number: "+1-555-123-4567",
        custom_fields: [
            {
                name: "Contact Person",
                field_type: "text",
                is_required: true,
                field_values: []
            },
            {
                name: "Payment Terms",
                field_type: "dropdown",
                is_required: true,
                field_values: [
                    { "value": "Net 30" },
                    { "value": "Net 60" },
                    { "value": "Due on Receipt" }
                ]
            },
            {
                name: "Service Types",
                field_type: "checkbox",
                is_required: false,
                field_values: [
                    { "value": "Consulting" },
                    { "value": "Development" },
                    { "value": "Maintenance" }
                ]
            }
        ]
    };

    // State for custom fields
    // Update the initial state to have consistent properties
    const [customFields, setCustomFields] = useState<CustomFieldForm[]>([
        {
            name: '',
            fieldType: 'text',
            isRequired: false,
            isEnabled: true, // Default to enabled
            fieldValues: []
        }
    ]);

    // Add a new custom field
    const addCustomField = () => {
        setCustomFields([...customFields, {
            name: '',
            fieldType: 'text',
            isRequired: false,
            isEnabled: true,
            fieldValues: []
        }]);
    };

    // Add a new field value option to a dropdown or radio field
    const addFieldValue = (fieldIndex: number) => {
        const updatedFields = [...customFields];
        updatedFields[fieldIndex].fieldValues.push({ value: '' });
        setCustomFields(updatedFields);
    };

    // Update a custom field
    const updateField = (index: number, field: keyof CustomFieldForm, value: any) => {
        const updatedFields = [...customFields];

        // If changing to dropdown/radio/checkbox but there are no options, add an empty one
        if (field === 'fieldType' && (value === 'dropdown' || value === 'radio' || value === 'checkbox') &&
            (!updatedFields[index].fieldValues || updatedFields[index].fieldValues.length === 0)) {
            updatedFields[index] = {
                ...updatedFields[index],
                [field]: value,
                fieldValues: [{ value: '' }] // Add one empty option
            };
        }
        // If changing from dropdown/radio/checkbox to another type, clear the options
        else if (field === 'fieldType' && value !== 'dropdown' && value !== 'radio' && value !== 'checkbox') {
            updatedFields[index] = {
                ...updatedFields[index],
                [field]: value,
                fieldValues: [] // Clear options
            };
        }
        // For all other changes
        else {
            updatedFields[index] = {
                ...updatedFields[index],
                [field]: value
            };
        }

        setCustomFields(updatedFields);
    };

    // Update a field value
    const updateFieldValue = (fieldIndex: number, valueIndex: number, value: string) => {
        const updatedFields = [...customFields];
        updatedFields[fieldIndex].fieldValues[valueIndex].value = value;
        setCustomFields(updatedFields);
    };

    // Remove a field value
    const removeFieldValue = (fieldIndex: number, valueIndex: number) => {
        const updatedFields = [...customFields];
        updatedFields[fieldIndex].fieldValues.splice(valueIndex, 1);
        setCustomFields(updatedFields);
    };
    // Remove a custom field
    const removeField = (index: number) => {
        setCustomFields(customFields.filter((_, i) => i !== index));
    };

    // Load example data
    const loadExampleData = () => {
        setEntityName(exampleEntityData.name);
        setEntityType(exampleEntityData.entity_type);
        setEntityEmail(exampleEntityData.email);
        setEntityPhone(exampleEntityData.mobile_number);

        // Convert API format to form format
        const formattedFields = exampleEntityData.custom_fields.map(field => ({
            name: field.name,
            fieldType: field.field_type as any,
            isRequired: field.is_required,
            isEnabled: true,
            fieldValues: field.field_values || []
        }));

        setCustomFields(formattedFields);
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!entityName.trim()) {
            alert('Entity name is required');
            return;
        }

        // Validate that dropdown, radio and checkbox fields have at least one option
        const invalidField = customFields.find(field =>
            (field.fieldType === 'dropdown' || field.fieldType === 'radio' || field.fieldType === 'checkbox') &&
            field.fieldValues.length === 0 &&
            field.isEnabled // Only check enabled fields
        );

        if (invalidField) {
            alert(`The field "${invalidField.name}" needs at least one option`);
            return;
        }

        try {
            setIsSubmitting(true);

            // Log the form data for debugging
            console.log("Raw form data:", {
                name: entityName,
                type: entityType,
                email: entityEmail,
                phone: entityPhone,
                address: entityAddress,
                customFields: customFields
            });

            // Transform our form data to match API structure
            const entityData = {
                name: entityName,
                entity_type: entityType,
                email: entityEmail,
                mobile_number: entityPhone,
                address: entityAddress,
                custom_fields: customFields
                    .filter(field => field.name.trim() !== '')
                    .map((field) => ({
                        id: field.id || 0,
                        name: field.name,
                        field_type: field.fieldType,
                        is_required: field.isRequired,
                        is_enabled: field.isEnabled,
                        field_values: field.fieldValues
                            .filter(val => val.value.trim() !== '')
                            .map((val) => ({
                                id: val.id || 0,
                                value: val.value
                            }))
                    }))
            };

            console.log('Sending entity data to API:', JSON.stringify(entityData, null, 2));
            const result = await createEntity(entityData);
            console.log('API response:', result);
            navigate('/admin/entities');
        } catch (error: any) {
            console.error('Failed to create entity:', error);
            // Show more detailed error messages
            if (error.response?.data) {
                // API returned error details
                const errorMessage = JSON.stringify(error.response.data, null, 2);
                alert(`Failed to create entity. API Error: ${errorMessage}`);
            } else {
                alert('Failed to create entity. Please check console for details.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-card dark:bg-card p-6 rounded-lg shadow-sm border border-border">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-foreground">Add New Entity</h2>
                <Button
                    type="button"
                    variant="outline"
                    onClick={loadExampleData}
                    className="text-foreground"
                >
                    Load Example Data
                </Button>
            </div>
            <form className="space-y-8 max-w-2xl" onSubmit={handleSubmit}>
                {/* Basic Entity Information */}
                <div className="space-y-6">
                    <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                        Entity Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="entityName" className="block text-sm font-medium text-foreground">
                                Entity Name
                            </label>
                            <Input
                                id="entityName"
                                name="entityName"
                                placeholder="Enter entity name"
                                className="text-foreground"
                                value={entityName}
                                onChange={(e) => setEntityName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="entityType" className="block text-sm font-medium text-foreground">
                                Entity Type
                            </label>
                            <select
                                id="entityType"
                                value={entityType}
                                onChange={(e) => setEntityType(e.target.value)}  // This line was missing
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                            >
                                <option value="company">Company</option>
                                <option value="individual">Individual</option>
                                <option value="government">Government</option>
                                <option value="non-profit">Non-profit</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="address" className="block text-sm font-medium text-foreground">
                            Address
                        </label>
                        <Input
                            id="address"
                            name="address"
                            placeholder="Enter address"
                            className="text-foreground"
                            value={entityAddress}
                            onChange={(e) => setEntityAddress(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="city" className="block text-sm font-medium text-foreground">
                                City
                            </label>
                            <Input
                                id="city"
                                name="city"
                                placeholder="City"
                                className="text-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="state" className="block text-sm font-medium text-foreground">
                                State/Province
                            </label>
                            <Input
                                id="state"
                                name="state"
                                placeholder="State/Province"
                                className="text-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="postalCode" className="block text-sm font-medium text-foreground">
                                Postal Code
                            </label>
                            <Input
                                id="postalCode"
                                name="postalCode"
                                placeholder="Postal Code"
                                className="text-foreground"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="Email address"
                                className="text-foreground"
                                value={entityEmail}
                                onChange={(e) => setEntityEmail(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                                Phone Number
                            </label>
                            <Input
                                id="phone"
                                name="phone"
                                placeholder="Phone number"
                                className="text-foreground"
                                value={entityPhone}
                                onChange={(e) => setEntityPhone(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Custom Quotation Fields */}
                <div className="space-y-6">
                    <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                        Custom Quotation Fields
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Define what fields should be included in quotations for this entity.
                    </p>

                    <div className="space-y-4">
                        {customFields.map((field, index) => (
                            <div key={field.id ?? index} className="grid grid-cols-12 gap-3 items-center bg-muted/30 p-3 rounded-md border border-border">
                                <div className="col-span-4">
                                    <label className="text-xs text-muted-foreground mb-1 block">Field Name</label>
                                    <Input
                                        value={field.name}
                                        onChange={e => updateField(index, 'name', e.target.value)}
                                        className="text-foreground"
                                        placeholder="Field name"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <label className="text-xs text-muted-foreground mb-1 block">Field Type</label>
                                    <select
                                        value={field.fieldType}
                                        onChange={e => updateField(index, 'fieldType', e.target.value)}
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none text-foreground"
                                    >
                                        {fieldTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2 flex items-center pt-5">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`required-${index}`}
                                            checked={field.isRequired}
                                            onCheckedChange={checked => updateField(index, 'isRequired', !!checked)}
                                        />
                                        <label htmlFor={`required-${index}`} className="text-sm text-foreground">
                                            Required
                                        </label>
                                    </div>
                                </div>
                                <div className="col-span-2 flex items-center pt-5">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`enabled-${index}`}
                                            checked={field.isEnabled}
                                            onCheckedChange={checked => updateField(index, 'isEnabled', !!checked)}
                                        />
                                        <label htmlFor={`enabled-${index}`} className="text-sm text-foreground">
                                            Enabled
                                        </label>
                                    </div>
                                </div>
                                <div className="col-span-1 flex justify-end pt-5">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeField(index)}
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {customFields.map((field, fieldIndex) => (
                            (field.fieldType === 'dropdown' || field.fieldType === 'radio' || field.fieldType === 'checkbox') && (
                                <div key={`values-${fieldIndex}`} className="grid grid-cols-12 gap-3 items-center bg-muted/20 p-3 rounded-md border border-border">
                                    <div className="col-span-11 space-y-2">
                                        <label className="text-xs text-muted-foreground mb-1 block">
                                            {field.fieldType.charAt(0).toUpperCase() + field.fieldType.slice(1)} Options
                                        </label>
                                        {field.fieldValues.map((value, valueIndex) => (
                                            <div key={valueIndex} className="flex items-center space-x-2">
                                                <Input
                                                    value={value.value}
                                                    onChange={e => updateFieldValue(fieldIndex, valueIndex, e.target.value)}
                                                    placeholder={`Option ${valueIndex + 1}`}
                                                    className="text-foreground"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeFieldValue(fieldIndex, valueIndex)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addFieldValue(fieldIndex)}
                                            className="text-foreground mt-2"
                                        >
                                            Add Option
                                        </Button>
                                    </div>
                                </div>
                            )
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addCustomField}
                            className="text-foreground flex items-center mt-2"
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Add Field
                        </Button>
                    </div>
                </div>                <div className="pt-4">
                    <Button type="submit">
                        Create Entity
                    </Button>
                    <Button type="button" variant="outline" className="ml-2 dark:text-white" onClick={() => navigate('/admin/dashboard')}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddEntity;
