import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { MapPin, X, Check } from 'lucide-react-native';

import { Colors, TextStyles } from '@/constants/GraphSettings';

type BackgroundLocationDisclosureProps = {
  visible: boolean;
  onAccept: () => void;
  onDeny: () => void;
};

export default function BackgroundLocationDisclosure({
  visible,
  onAccept,
  onDeny,
}: BackgroundLocationDisclosureProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDeny}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <MapPin size={32} color={Colors.primary} />
          </View>

          <Text style={styles.title}>
            Utilisation de la localisation en arrière-plan
          </Text>

          <Text style={styles.body}>
            Ski'Ut collecte des données de localisation pour permettre le suivi
            de votre vitesse de glisse et de la distance parcourue, même lorsque
            l'application est fermée ou n'est pas utilisée.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.denyButton}
              onPress={onDeny}
              activeOpacity={0.7}
            >
              <X size={20} color={Colors.muted} />
              <Text style={styles.denyButtonText}>Refuser</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={onAccept}
              activeOpacity={0.7}
            >
              <Check size={20} color={Colors.white} />
              <Text style={styles.acceptButtonText}>Accepter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  acceptButton: {
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  acceptButtonText: {
    ...TextStyles.button,
    color: Colors.white,
    fontWeight: '600',
  },
  body: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    elevation: 5,
    maxWidth: 340,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    width: '100%',
  },
  denyButton: {
    alignItems: 'center',
    borderColor: Colors.lightMuted,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  denyButtonText: {
    ...TextStyles.button,
    color: Colors.muted,
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    marginBottom: 16,
    width: 64,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 12,
    textAlign: 'center',
  },
});
