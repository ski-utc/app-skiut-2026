import { Text, View } from "react-native";
import Header from "../components/header";

// @ts-ignore
export default function PlanningScreen() {
  return (
    <View
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Header/>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Edit app/planning.tsx to edit this screen.</Text>
      </View>
    </View>
  );
}

