import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">HireClix CRM</h1>
        <p className="text-muted-foreground">Recruiting CRM Platform</p>
        <Link to="/email">
          <Button size="lg">
            <Mail className="h-5 w-5 mr-2" /> Email Module
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
