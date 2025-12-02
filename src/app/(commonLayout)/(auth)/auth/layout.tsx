import PublicFooter from "@/components/Shared/PublicFooter";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <div className="min-h-dvh">
                {children}
                <PublicFooter/>
            </div>
        </>
    );
};


export default AuthLayout