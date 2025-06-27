import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real application, you would handle authentication here
        // For now, just navigate to admin dashboard if fields are not empty
        if (email && password) {
            navigate('/react-vite-supreme/admin/dashboard');
        }
    }; return (
        <div className="flex items-center justify-center min-h-screen w-full bg-background">
            <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg dark:shadow-indigo-500/10">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-foreground">eQuotation System</h1>
                    <p className="mt-2 text-muted-foreground">Sign in to your account</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                Email address
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1"
                                placeholder="Enter your email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-foreground">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full">
                        Sign in
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default Login;
