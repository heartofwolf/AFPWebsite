import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/admin/login-form";
import GalleryManagement from "@/components/admin/gallery-management";
import PhotoManagement from "@/components/admin/photo-management";
import PasswordChange from "@/components/admin/password-change";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Button>
            </Link>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-light text-center">
                Admin Portal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LoginForm onLogin={() => setIsAuthenticated(true)} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Button>
            </Link>
            <h1 className="text-2xl font-light">Portfolio Admin</h1>
            <Button 
              variant="outline" 
              onClick={() => setIsAuthenticated(false)}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <GalleryManagement />
            <PasswordChange />
          </div>
          <PhotoManagement />
        </div>
      </div>
    </div>
  );
}
