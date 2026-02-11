import { getSession } from "@/lib/auth";
import { JoinClient } from "./join-client";

export default async function JoinPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await getSession();

  // When not logged in, the layout doesn't provide a container wrapper
  // So we add our own padding
  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <JoinClient token={token} user={null} />
      </div>
    );
  }

  return (
    <JoinClient
      token={token}
      user={{
        name: session.name,
        birthday: session.birthday,
        phone: session.phone,
      }}
    />
  );
}
