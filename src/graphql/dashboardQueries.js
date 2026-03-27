/**
 * Shared GraphQL query strings for dashboard hooks.
 * These were previously duplicated in useOptimizedDashboard.js and useOptimizedActivitiesDashboard.js.
 */

export const OPTIMIZED_ACTIVITIES_DASHBOARD = `
  query OptimizedActivitiesDashboard($filters: DashboardFiltersInput) {
    optimizedActivitiesDashboard(filters: $filters) {
      summary {
        totalActivities
        totalMaleParticipants
        totalFemaleParticipants
        totalTwaParticipants
        totalParticipants
        avgFemalePercentage
        avgTwaInclusionRate
        provincesWithActivities
      }
      byActivityType {
        activityType
        activityCount
        maleParticipants
        femaleParticipants
        twaParticipants
        totalParticipants
      }
      byProvince {
        province
        provinceId
        activityCount
        totalParticipants
      }
      microProjects {
        totalProjects
        agricultureProjects
        livestockProjects
        commerceProjects
        totalBeneficiaries
      }
      lastUpdated
    }
  }
`;

export const OPTIMIZED_RESULTS_FRAMEWORK = `
  query OptimizedResultsFramework($filters: DashboardFiltersInput) {
    optimizedResultsFramework(filters: $filters) {
      summary {
        totalSections
        totalIndicators
        totalAchievements
        avgAchievementRate
        targetsMet
        targetsMissed
      }
      bySection {
        sectionId
        sectionName
        totalIndicators
        totalAchievements
        avgAchievementRate
        targetsMet
        targetsMissed
      }
      indicatorPerformance {
        indicatorId
        indicatorName
        targetValue
        totalAchieved
        achievementPercentage
        status
      }
      lastUpdated
    }
  }
`;
