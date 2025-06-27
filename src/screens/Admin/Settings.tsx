import React from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const Settings = () => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium mb-6">System Settings</h2>

            <div className="max-w-3xl space-y-8">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium mb-4">Company Information</h3>

                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                                    Company Name
                                </label>
                                <Input
                                    id="companyName"
                                    name="companyName"
                                    defaultValue="eQuotation Systems Inc."
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    defaultValue="info@equotation.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Address
                            </label>
                            <Input
                                id="address"
                                name="address"
                                defaultValue="123 Business Ave, Suite 100"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                    City
                                </label>
                                <Input
                                    id="city"
                                    name="city"
                                    defaultValue="Metro City"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                    State/Province
                                </label>
                                <Input
                                    id="state"
                                    name="state"
                                    defaultValue="CA"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                                    Postal Code
                                </label>
                                <Input
                                    id="postalCode"
                                    name="postalCode"
                                    defaultValue="90210"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    defaultValue="+1 (555) 123-4567"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                                    Website
                                </label>
                                <Input
                                    id="website"
                                    name="website"
                                    defaultValue="www.equotation.com"
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" size="sm">
                                Save Company Info
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium mb-4">User Management</h3>

                    <div className="space-y-4">
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-2 px-4 text-left">Name</th>
                                        <th className="py-2 px-4 text-left">Email</th>
                                        <th className="py-2 px-4 text-left">Role</th>
                                        <th className="py-2 px-4 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-t">
                                        <td className="py-2 px-4">John Admin</td>
                                        <td className="py-2 px-4">admin@example.com</td>
                                        <td className="py-2 px-4">Administrator</td>
                                        <td className="py-2 px-4">
                                            <Button variant="outline" size="sm">Edit</Button>
                                        </td>
                                    </tr>
                                    <tr className="border-t">
                                        <td className="py-2 px-4">Jane User</td>
                                        <td className="py-2 px-4">jane@example.com</td>
                                        <td className="py-2 px-4">Manager</td>
                                        <td className="py-2 px-4">
                                            <Button variant="outline" size="sm">Edit</Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <Button size="sm">
                            Add New User
                        </Button>
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-medium mb-4">Quotation Settings</h3>

                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                                    Default Tax Rate (%)
                                </label>
                                <Input
                                    id="taxRate"
                                    name="taxRate"
                                    type="number"
                                    defaultValue="10"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                                    Currency
                                </label>
                                <select
                                    id="currency"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    defaultValue="usd"
                                >
                                    <option value="usd">USD ($)</option>
                                    <option value="eur">EUR (€)</option>
                                    <option value="gbp">GBP (£)</option>
                                    <option value="jpy">JPY (¥)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="quotationPrefix" className="block text-sm font-medium text-gray-700">
                                Quotation Number Prefix
                            </label>
                            <Input
                                id="quotationPrefix"
                                name="quotationPrefix"
                                defaultValue="QT-"
                            />
                            <p className="text-sm text-gray-500 mt-1">Example: QT-2025-001</p>
                        </div>

                        <div className="pt-2">
                            <Button type="submit" size="sm">
                                Save Quotation Settings
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
