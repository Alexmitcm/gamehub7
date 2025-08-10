import BackButton from "@/components/Shared/BackButton";
import PageLayout from "@/components/Shared/PageLayout";
import { Card, CardHeader } from "@/components/Shared/UI";
import ClaimRewardsContent from "./ClaimRewardsContent";

const TestClaimRewardsPage = () => {
  return (
    <PageLayout title="Claim Your Rewards (Test)">
      <Card>
        <CardHeader
          icon={<BackButton path="/settings" />}
          title="Claim Your Rewards (Test)"
        />
        <div className="p-5">
          <div className="mb-4 text-center">
            <h3 className="font-semibold text-green-600 text-lg">
              ✅ Route is working!
            </h3>
            <p className="text-gray-600">
              This is the test version of the Claim Rewards page.
            </p>
          </div>
          <ClaimRewardsContent />
        </div>
      </Card>
    </PageLayout>
  );
};

export default TestClaimRewardsPage;
