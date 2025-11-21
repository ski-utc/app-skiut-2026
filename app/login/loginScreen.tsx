import { SafeAreaView, StyleSheet } from "react-native";

import { Colors } from "@/constants/GraphSettings";

import OAuthScreen from "./OAuthScreen";

export default function LoginScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <OAuthScreen />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        flex: 1,
    },
});
