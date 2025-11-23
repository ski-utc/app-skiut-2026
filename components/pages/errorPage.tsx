import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { AlertTriangle, ArrowLeft, RotateCcw } from "lucide-react-native";

import { Colors, TextStyles } from "@/constants/GraphSettings";

import Header from "../header";

type ErrorScreenProps = {
  error: string;
  retry?: () => void;
}

export default function ErrorScreen({ error, retry }: ErrorScreenProps) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const handlePress = () => {
    if (retry) {
      retry();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Header refreshFunction={retry || null} disableRefresh={false} />
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
          onPress={handlePress}
          style={styles.actionButton}
          activeOpacity={0.8}
        >
          {retry ? (
            <RotateCcw size={20} color={Colors.white} />
          ) : (
            <ArrowLeft size={20} color={Colors.white} />
          )}
          <Text style={styles.actionButtonText}>
            {retry ? "Réessayer" : "Retour"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
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
  actionButtonText: {
    ...TextStyles.button,
    color: Colors.white,
    fontSize: 16,
  },
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
  title: {
    ...TextStyles.h2,
    color: Colors.primaryBorder,
    marginBottom: 16,
    textAlign: 'center',
  },
});
