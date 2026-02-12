export default {
    expo: {
        name: "The Last Cigarette",
        slug: "the-last-cigarette",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        assetBundlePatterns: [
            "**/*"
        ],
        ios: {
            supportsTablet: true
        },
        android: {
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#ffffff"
            },
            package: "com.mdhv11.thelastcigarette",
            permissions: [
                "RECEIVE_BOOT_COMPLETED",
                "SCHEDULE_EXACT_ALARM"
            ]
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        plugins: [
            "expo-secure-store",
            "expo-font",
            "expo-notifications"
        ],
        extra: {
            apiUrl: process.env.EXPO_PUBLIC_API_URL,
            eas: {
                projectId: "your-project-id"
            }
        }
    }
};
