import PublicNavbar from "@/components/Shared/PublicNavbar";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <PublicNavbar />
            <div className="min-h-dvh">
                {children}
            </div>
        </>
    );
};

export default CommonLayout;