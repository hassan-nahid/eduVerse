import PublicFooter from "@/components/Shared/PublicFooter";

const CommonLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
                <div className="min-h-dvh">
                    {children}
                </div>
            <PublicFooter />
        </>
    );
};

export default CommonLayout;