import MainFooter from "./MainFooter"
import MainNavbar from "./MainNavbar"
import { Toaster } from 'react-hot-toast';
import MobileDock from "./MobileDock";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <MobileDock />
      <div className="min-h-screen flex flex-col">
        <MainNavbar />
        <main className="flex-grow">{children}</main>
        <MainFooter />
        <Toaster position="top-right" />
      </div>
    </div>
  )
}
