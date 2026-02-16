import LoginForm from '@/components/auth/login-form'

export default function LoginPage() {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-background overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] h-[60%] w-[60%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] h-[60%] w-[60%] rounded-full bg-secondary/5 blur-[120px]" />
            </div>

            <div className="z-10 w-full max-w-md space-y-8 flex flex-col items-center">
                <div className="flex flex-col items-center space-y-2 text-center">
                    <h1 className="text-5xl font-black tracking-tighter text-primary">
                        AUTOMATE<span className="text-secondary">BOSS</span>
                    </h1>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-[0.3em]">
                        Operations Portal
                    </p>
                </div>

                <LoginForm />

                <p className="text-center text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    &copy; {new Date().getFullYear()} AutomateBoss. All rights reserved.
                </p>
            </div>
        </div>
    )
}
