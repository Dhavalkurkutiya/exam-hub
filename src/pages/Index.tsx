
import { Link } from "react-router-dom";
import { FileText, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Index = () => {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-blue-500" />,
      title: "All Branches",
      description: "Access question papers for BTech CSE, BCS, Pharmacy and all other branches",
    },
    {
      icon: <FileText className="h-6 w-6 text-blue-500" />,
      title: "Semester Wise",
      description: "Organized by semesters from 1st to 8th for easy access",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="hero-gradient py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Your College Question Paper Repository
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              Access previous year question papers for all branches and semesters in one place
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="px-8">
                <Link to="/branches">Browse Papers</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/search">Search Papers</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Everything You Need For Exam Preparation
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="p-3 bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Ready to find your question papers?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Browse by branch or semester to find exactly what you need
            </p>
            <Button asChild size="lg" className="px-8">
              <Link to="/branches" className="flex items-center gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
