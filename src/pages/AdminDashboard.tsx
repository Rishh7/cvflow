
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { ApplicationTrendsChart } from "@/components/admin/ApplicationTrendsChart";
import { ExperienceClusterChart } from "@/components/admin/ExperienceClusterChart";
import { UpcomingInterviews } from "@/components/admin/UpcomingInterviews";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {  
  ChevronLeft, 
  ChevronRight, 
  MoreVertical,
  Clock,
  Users,
  CreditCard,
  Briefcase,
  CheckCircle,
  Clock as ClockIcon,
  LogOut
} from "lucide-react";

type CV = Database["public"]["Tables"]["cvs"]["Row"];
type Position = Database["public"]["Tables"]["positions"]["Row"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentDate] = useState(new Date());

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin/login");
        return;
      }

      const { data: adminData } = await supabase
        .from('admin_users')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!adminData?.is_admin) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page",
          variant: "destructive",
        });
        navigate("/admin/login");
      }
    };

    checkAdminStatus();
  }, [navigate, toast]);

  const { data: cvs, isLoading: cvsLoading } = useQuery({
    queryKey: ["cvs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cvs")
        .select("*")
        .order("requirements_match", { ascending: false });

      if (error) throw error;
      return data as CV[];
    },
  });

  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("positions")
        .select("*");

      if (error) throw error;
      return data as Position[];
    },
  });

  if (cvsLoading || positionsLoading) {
    return <div>Loading...</div>;
  }

  if (!cvs) return null;

  // Calculate stats for dashboard
  const totalApplications = cvs.length;
  const pendingApplications = cvs.filter(cv => cv.status === 'pending').length;
  const acceptedApplications = cvs.filter(cv => cv.status === 'accepted').length;
  const averageExperience = cvs.reduce((acc, cv) => acc + cv.years_experience, 0) / cvs.length;

  // Invoices stats
  const overdueInvoices = 6;
  const overdueInvoicesGrowth = 2.7;

  // Recent emails data
  const recentEmails = [
    { 
      sender: "Hannah Morgan", 
      subject: "Meeting scheduled", 
      time: "1:24 PM", 
      avatar: "/avatars/hannah.jpg" 
    },
    { 
      sender: "Megan Clark", 
      subject: "Update on marketing campaign", 
      time: "12:32 PM", 
      avatar: "/avatars/megan.jpg" 
    },
    { 
      sender: "Brandon Williams", 
      subject: "Designly 2.0 is about to launch", 
      time: "Yesterday at 8:57 PM", 
      avatar: "/avatars/brandon.jpg" 
    },
    { 
      sender: "Reid Smith", 
      subject: "My friend Julie loves Dappr!", 
      time: "Yesterday at 8:49 PM", 
      avatar: "/avatars/reid.jpg" 
    }
  ];

  // To-do list
  const todoList = [
    { task: "Run payroll", date: "Mar 4 at 6:00 pm", icon: <Briefcase className="h-5 w-5" /> },
    { task: "Review time off request", date: "Mar 7 at 6:00 pm", icon: <ClockIcon className="h-5 w-5" /> },
    { task: "Sign board resolution", date: "Mar 12 at 6:00 pm", icon: <CheckCircle className="h-5 w-5" /> },
    { task: "Finish onboarding Tony", date: "Mar 12 at 6:00 pm", icon: <Users className="h-5 w-5" /> }
  ];

  // Experience distribution data for pie chart
  const experienceGroups = cvs.reduce((acc, cv) => {
    const group = `${Math.floor(cv.years_experience / 2) * 2}-${Math.floor(cv.years_experience / 2) * 2 + 2} years`;
    if (!acc[group]) acc[group] = [];
    acc[group].push(cv);
    return acc;
  }, {} as Record<string, CV[]>);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleViewCandidates = () => {
    navigate("/admin/sorting");
  };

  return (
    <div className="bg-primary relative hidden md:flex flex-col items-center justify-center p-8 min-h-screen">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-[88px] bg-black flex flex-col items-center py-8 text-white">
        <div className="mb-12">
          <span className="text-xl font-bold">Cona</span>
        </div>
        <div className="flex flex-col items-center space-y-8">
          <Button variant="ghost" size="icon" className="text-white" onClick={handleViewCandidates}>
            <Users className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Briefcase className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <CreditCard className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white">
            <Clock className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-[88px] p-6">
        {/* Header */}
        <div className="bg-secondary backdrop-blur rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center">
            <h1 className="text-foreground-secondary font-bold">Good morning, James!</h1>
            <div className="flex items-center space-x-4">
              <Button variant="destructive" className="rounded-xl gap-2" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
                <Avatar className="bg-foreground">
                <AvatarImage src="/avatars/batman.jpg" />
                <AvatarFallback>JD</AvatarFallback>
                </Avatar>
            </div>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card className="bg-white/80 backdrop-blur border-none shadow-none">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <CheckCircle className="h-6 w-6" />
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <h2 className="text-2xl font-bold">{acceptedApplications}</h2>
                <p className="text-sm text-gray-500">Accepted applications</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-none shadow-none">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <Clock className="h-6 w-6" />
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <h2 className="text-2xl font-bold">{pendingApplications}</h2>
                <p className="text-sm text-gray-500">Pending review</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-none shadow-none">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <Users className="h-6 w-6" />
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <h2 className="text-2xl font-bold">{totalApplications}</h2>
                <p className="text-sm text-gray-500">Total applicants</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur border-none shadow-none">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <Briefcase className="h-6 w-6" />
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <h2 className="text-2xl font-bold">{averageExperience.toFixed(1)}</h2>
                <p className="text-sm text-gray-500">Average experience (years)</p>
              </CardContent>
            </Card>
          </div>

          {/* Navigation arrows */}
          <div className="flex justify-center mt-4">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Main dashboard content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left column */}
          <div className="col-span-2 space-y-6">
            {/* Application Trends chart */}
            <Card className="bg-secondary backdrop-blur border-none">
              <CardHeader>
                <CardTitle>Application Trends</CardTitle>
                <p className="text-sm text-gray-500">Last 7 days VS prior week</p>
              </CardHeader>
              <CardContent>
                <ApplicationTrendsChart cvs={cvs} />
              </CardContent>
            </Card>

            {/* Invoices overdue */}
            <Card className="bg-secondary backdrop-blur border-none">
              <CardHeader>
                <CardTitle>Invoices overdue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end">
                  <h2 className="text-5xl font-bold">{overdueInvoices}</h2>
                  <span className="ml-2 text-red-500 font-medium">+{overdueInvoicesGrowth}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent emails */}
            <Card className="bg-secondary backdrop-blur border-none">
              <CardHeader>
                <CardTitle>Recent emails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEmails.map((email, index) => (
                    <div key={index} className="flex items-center">
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={email.avatar} />
                        <AvatarFallback>{email.sender.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{email.sender}</p>
                        <p className="text-sm text-gray-500">{email.subject}</p>
                      </div>
                      <span className="text-sm text-gray-500">{email.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Experience Distribution Pie Chart */}
            <ExperienceClusterChart experienceGroups={experienceGroups} />

            {/* Upcoming Interviews - NEW COMPONENT */}
            <UpcomingInterviews />

            {/* To-do list */}
            <Card className="bg-secondary backdrop-blur border-none">
              <CardHeader>
                <CardTitle>Your to-Do list</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todoList.map((todo, index) => (
                    <div key={index} className="flex items-center">
                      <div className="bg-black text-white rounded-full p-2 mr-4">
                        {todo.icon}
                      </div>
                      <div>
                        <p className="font-medium">{todo.task}</p>
                        <p className="text-sm text-gray-500">{todo.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
