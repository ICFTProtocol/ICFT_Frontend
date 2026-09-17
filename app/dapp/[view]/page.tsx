import { WorkspaceView } from "../WorkspaceView";

export default async function ViewPage({ params }: { params: Promise<{ view: string }> }) {
  const { view } = await params;
  return <WorkspaceView view={view} />;
}
