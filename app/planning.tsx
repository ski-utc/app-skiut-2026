import { Text, View } from "react-native";
import Header from "../components/Header";

export default function Planning() {
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
      <Header text="Planning"/>
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

