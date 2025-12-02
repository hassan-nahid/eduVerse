import PublicFooter from "@/components/Shared/PublicFooter";
import PublicNavbar from "@/components/Shared/PublicNavbar";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <PublicNavbar />
            <div className="h-dvh">
                {children}
            </div>
            <PublicFooter />
        </>
    );
};

export default CommonLayout;