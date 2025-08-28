import { FileUploadZone } from '@/components/FileUploadZone';
import { Files, Zap } from 'lucide-react';
import heroImage from '@/assets/file-fusion-hero.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <img 
                src={heroImage} 
                alt="File fusion illustration showing multiple documents being combined"
                className="rounded-2xl shadow-elegant max-w-md w-full"
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              File Fuser Buddy
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Combine up to 1,000 text files into a single, organized document with numbered headings
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-white/80 mb-12">
              <div className="flex items-center gap-2">
                <Files className="h-5 w-5" />
                <span>Up to 1,000 files</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                <span>100MB total size</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-12 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FileUploadZone />
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              Fast, secure, client-side file processing. Your files never leave your browser.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
