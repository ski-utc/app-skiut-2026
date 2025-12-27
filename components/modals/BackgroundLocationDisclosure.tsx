
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
            Ski'Ut collecte des données de localisation pour permettre le suivi de votre vitesse de glisse et de la distance parcourue, même lorsque l'application est fermée ou n'est pas utilisée.
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    textAlign: 'center',
    marginBottom: 12,
  },
  body: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  denyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.lightMuted,
    gap: 8,
  },
  denyButtonText: {
    ...TextStyles.button,
    color: Colors.muted,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 8,
  },
  acceptButtonText: {
    ...TextStyles.button,
    color: Colors.white,
    fontWeight: '600',
  },
});
