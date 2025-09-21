import { SafeAreaView, StyleSheet } from "react-native";
import OAuthScreen from "./OAuthScreen";
import { Colors } from "@/constants/GraphSettings";

export default function LoginScreen() {
    return (
        <SafeAreaView style={styles.container}>
          <OAuthScreen/>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
});
