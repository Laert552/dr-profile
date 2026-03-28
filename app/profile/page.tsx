import { getProfile } from "@/actions/profile";
import ProfileForm from "@/app/components/ProfileForm";
import SignOutButton from "@/app/components/SignOutButton";

export const metadata = {
  title: "My Profile | Doctor Profile System",
};

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 py-10 px-4 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Doctor Profile
            </h1>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-600">
              Keep your professional information up to date.
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-900/5 ring-1 ring-slate-900/[0.04] sm:p-8">
          <ProfileForm initialData={profile} />
        </div>
      </div>
    </div>
  );
}
