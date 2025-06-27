import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createEntity } from '../../services/entityService';

interface FieldValue {
    id?: number;
    value: string;
}

interface CustomFieldForm {
    name: string;
    fieldType: 'text' | 'dropdown' | 'radio' | 'textarea';
    isRequired: boolean;
    fieldValues: FieldValue[];
}

const fieldTypeOptions = [
    { value: 'text', label: 'Text' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'textarea', label: 'Text Area' }
];

const AddEntity = () => {
    const navigate = useNavigate();

    // State for entity form
    const [entityName, setEntityName] = useState('');
    const [entityType, setEntityType] = useState('company');
    const [entityEmail, setEntityEmail] = useState('');
    const [entityPhone, setEntityPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for custom fields
    const [customFields, setCustomFields] = useState<CustomFieldForm[]>([
        { name: '', fieldType: 'text', isRequired: false, fieldValues: [] }
    ]);

    // Add a new custom field
    const addCustomField = () => {
        setCustomFields([...customFields, {
            name: '',
            fieldType: 'text',
            isRequired: false,
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
        updatedFields[index] = {
            ...updatedFields[index],
            [field]: value,
            // Reset field values if changing field type from dropdown/radio to something else
            fieldValues: (field === 'fieldType' &&
                value !== 'dropdown' &&
                value !== 'radio') ? [] : updatedFields[index].fieldValues
        };
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

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        if (!entityName.trim()) {
            alert('Entity name is required');
            return;
        }

        // Validate that dropdown and radio fields have at least one option
        const invalidField = customFields.find(field =>
            (field.fieldType === 'dropdown' || field.fieldType === 'radio') &&
            field.fieldValues.length === 0
        );

        if (invalidField) {
            alert(`The field "${invalidField.name}" needs at least one option`);
            return;
        }

        try {
            setIsSubmitting(true);

            // Transform our form data to match API structure
            const entityData = {
                name: entityName,
                entity_type: entityType,
                email: entityEmail,
                mobile_number: entityPhone,
                custom_fields: customFields.map(field => ({
                    name: field.name,
                    field_type: field.fieldType,
                    is_required: field.isRequired,
                    field_values: field.fieldValues.map(val => ({
                        value: val.value
                    }))
                }))
            };

            // @ts-ignore - Ignoring the type mismatch since our API doesn't require IDs for new entities
            await createEntity(entityData);
            navigate('/react-vite-supreme/admin/entities');
        } catch (error) {
            console.error('Failed to create entity:', error);
            alert('Failed to create entity. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        navigate('/react-vite-supreme/admin/entities');
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Entities
                </Button>
            </div>

            <div className="bg-card dark:bg-card p-6 rounded-lg shadow-sm border border-border">
                <h2 className="text-xl font-medium mb-6 text-foreground">Add New Entity</h2>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    {/* Basic Entity Information */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-medium text-foreground border-b border-border pb-2">
                            Entity Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="entityName" className="block text-sm font-medium text-foreground">
                                    Entity Name*
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
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                                    value={entityType}
                                    onChange={(e) => setEntityType(e.target.value)}
                                >
                                    <option value="company">Company</option>
                                    <option value="individual">Individual</option>
                                    <option value="government">Government</option>
                                    <option value="non-profit">Non-profit</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="Enter email"
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
                                    placeholder="Enter phone number"
                                    className="text-foreground"
                                    value={entityPhone}
                                    onChange={(e) => setEntityPhone(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Custom Fields Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-border pb-2">
                            <h3 className="text-lg font-medium text-foreground">
                                Custom Fields
                            </h3>
                            <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                                <Plus className="mr-2 h-4 w-4" /> Add Field
                            </Button>
                        </div>

                        {customFields.map((field, index) => (
                            <div key={index} className="p-4 border border-border rounded-md bg-background">
                                <div className="flex justify-between mb-4">
                                    <h4 className="font-medium">Field #{index + 1}</h4>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeField(index)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                    <div className="md:col-span-5 space-y-2">
                                        <label htmlFor={`field-name-${index}`} className="block text-sm font-medium text-foreground">
                                            Field Name
                                        </label>
                                        <Input
                                            id={`field-name-${index}`}
                                            placeholder="Enter field name"
                                            value={field.name}
                                            onChange={(e) => updateField(index, 'name', e.target.value)}
                                            className="text-foreground"
                                        />
                                    </div>

                                    <div className="md:col-span-4 space-y-2">
                                        <label htmlFor={`field-type-${index}`} className="block text-sm font-medium text-foreground">
                                            Field Type
                                        </label>
                                        <select
                                            id={`field-type-${index}`}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                                            value={field.fieldType}
                                            onChange={(e) => updateField(index, 'fieldType', e.target.value as any)}
                                        >
                                            {fieldTypeOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-3 flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`field-required-${index}`}
                                                checked={field.isRequired}
                                                onCheckedChange={(checked) => updateField(index, 'isRequired', checked === true)}
                                            />
                                            <label
                                                htmlFor={`field-required-${index}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
                                            >
                                                Required
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {/* Value options for dropdown or radio fields */}
                                {(field.fieldType === 'dropdown' || field.fieldType === 'radio') && (
                                    <div className="mt-4 border-t border-border pt-4">
                                        <div className="flex justify-between mb-3">
                                            <h5 className="text-sm font-medium">Options</h5>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addFieldValue(index)}
                                            >
                                                <Plus className="mr-1 h-3 w-3" /> Add Option
                                            </Button>
                                        </div>

                                        {field.fieldValues.length === 0 ? (
                                            <div className="text-sm text-muted-foreground italic mb-2">
                                                No options added yet. Add at least one option.
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {field.fieldValues.map((value, valueIndex) => (
                                                    <div key={valueIndex} className="flex items-center gap-2">
                                                        <Input
                                                            placeholder={`Option ${valueIndex + 1}`}
                                                            value={value.value}
                                                            onChange={(e) => updateFieldValue(index, valueIndex, e.target.value)}
                                                            className="text-foreground"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeFieldValue(index, valueIndex)}
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Save Entity
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEntity;
