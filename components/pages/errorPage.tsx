import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AlertTriangle, ArrowLeft } from "lucide-react-native";

import { Colors, TextStyles } from "@/constants/GraphSettings";

import Header from "../header";

type ErrorStackParamList = {
  errorScreen: undefined;
}

type ErrorScreenProps = {
  error: string;
}

export default function ErrorScreen({ error }: ErrorScreenProps) {
  const navigation = useNavigation<NavigationProp<ErrorStackParamList>>();
  return (
    <View style={styles.container}>
      <Header refreshFunction={null} disableRefresh={true} />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <AlertTriangle size={64} color={Colors.error} />
        </View>

        <Text style={styles.title}>
          Oups ! Une erreur est survenue
        </Text>

        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error}
          </Text>
        </View>

        <Text style={styles.helpText}>
          Si l'erreur persiste, merci de contacter Mathis Delmaere
        </Text>

        <TouchableOpacity
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'homeScreen' as any }],
            });
          }}
          style={styles.retourButton}
        >
          <ArrowLeft size={20} color={Colors.white} />
          <Text style={styles.retourButtonText}>
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  errorContainer: {
    backgroundColor: Colors.lightMuted,
    borderRadius: 12,
    marginBottom: 24,
    padding: 16,
    width: '100%',
  },
  errorText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    lineHeight: 20,
    textAlign: 'center',
  },
  helpText: {
    ...TextStyles.body,
    color: Colors.muted,
    lineHeight: 18,
    marginBottom: 32,
    textAlign: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 60,
    height: 120,
    justifyContent: 'center',
    marginBottom: 24,
    width: 120,
  },
  retourButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    elevation: 3,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retourButtonText: {
    ...TextStyles.button,
    color: Colors.white,
    fontSize: 16,
  },
  title: {
    ...TextStyles.h2,
    color: Colors.primaryBorder,
    marginBottom: 16,
    textAlign: 'center',
  },
});
