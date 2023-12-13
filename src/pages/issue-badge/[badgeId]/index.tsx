import Issue from './Issue'
import SeedaoIssue from "@/pages/issue-badge/[badgeId]/SeedaoIssue";

function IssueBadge() {
    return process.env.NEXT_PUBLIC_SPECIAL_VERSION === 'seedao' ?
        <SeedaoIssue/>
        : <Issue />
}

export default IssueBadge
