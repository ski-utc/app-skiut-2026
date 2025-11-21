import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors, TextStyles } from "@/constants/GraphSettings";
import { useNavigation } from "@react-navigation/native";
import Header from "../header";
import { AlertTriangle, ArrowLeft } from "lucide-react-native";

interface ErrorScreenProps {
  error: string;
}

export default function ErrorScreen({ error }: ErrorScreenProps) {
  const navigation = useNavigation();
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
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...TextStyles.h2,
    color: Colors.primaryBorder,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorContainer: {
    backgroundColor: Colors.lightMuted,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  errorText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    textAlign: 'center',
    lineHeight: 20,
  },
  helpText: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
  },
  retourButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
    shadowColor: Colors.primaryBorder,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retourButtonText: {
    ...TextStyles.button,
    color: Colors.white,
    fontSize: 16,
  },
});
