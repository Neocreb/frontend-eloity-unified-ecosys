import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import FooterNav from "@/components/layout/FooterNav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const Settings = () => {
    const { user, logout } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Dark Mode functionality
    useEffect(() => {
        // Check for saved theme preference or use system preference
        const savedTheme = localStorage.getItem("theme");
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

        if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
            document.documentElement.classList.add("dark");
            setDarkMode(true);
        }

        // Simulate loading delay
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const toggleDarkMode = (checked: boolean) => {
        setDarkMode(checked);
        if (checked) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] pb-16 md:pb-0 bg-background text-foreground overflow-hidden">
                <div className="container mx-auto px-4 py-8 max-w-6xl">
                    <Skeleton className="h-8 w-48 mb-6" />

                    {/* Notification Settings Skeleton */}
                    <Card className="mb-6">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Skeleton className="h-5 w-40 mb-1" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                                <Skeleton className="h-6 w-11 rounded-full" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Skeleton className="h-5 w-40 mb-1" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                                <Skeleton className="h-6 w-11 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Display Settings Skeleton */}
                    <Card className="mb-6">
                        <CardHeader>
                            <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <Skeleton className="h-5 w-32 mb-1" />
                                    <Skeleton className="h-4 w-64" />
                                </div>
                                <Skeleton className="h-6 w-11 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-32 text-destructive" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
                <FooterNav />
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] pb-16 md:pb-0 bg-background text-foreground overflow-hidden">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>

                {/* Notification Settings */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Push Notifications</Label>
                                <p className="text-muted-foreground text-sm">
                                    Receive app notifications
                                </p>
                            </div>
                            <Switch
                                checked={notificationsEnabled}
                                onCheckedChange={setNotificationsEnabled}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Email Notifications</Label>
                                <p className="text-muted-foreground text-sm">
                                    Get updates via email
                                </p>
                            </div>
                            <Switch
                                checked={emailNotifications}
                                onCheckedChange={setEmailNotifications}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Display Settings */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Display</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <Label>Dark Mode</Label>
                                <p className="text-muted-foreground text-sm">
                                    Switch between light and dark theme
                                </p>
                            </div>
                            <Switch
                                checked={darkMode}
                                onCheckedChange={toggleDarkMode}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full text-destructive border-destructive"
                            onClick={logout}
                        >
                            Sign Out
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full text-destructive border-destructive"
                            onClick={() => {
                                // Handle account deletion logic here
                            }}
                        >
                            Delete Account
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <FooterNav />
        </div>
    );
};

export default Settings;