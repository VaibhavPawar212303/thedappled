import { redirect } from "next/navigation";
import { isTeacher } from "@/lib/teacher";

const TeacherLayout = async ({ children }: { children: React.ReactNode }) => {
    if (!(await isTeacher())) {
        return redirect("/");
    }

    return <>{children}</>;
};

export default TeacherLayout;
