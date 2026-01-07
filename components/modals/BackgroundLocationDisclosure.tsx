import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
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
            <MapPin size={40} color={Colors.primary} />
          </View>

          <Text style={styles.title}>
            Autorisation de localisation en arrière-plan requise
          </Text>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            persistentScrollbar={true}
          >
            <Text style={styles.subtitle}>
              Pourquoi cette autorisation est nécessaire ?
            </Text>

            <Text style={styles.body}>
              Ski'Ut a besoin d'accéder à votre position{' '}
              <Text style={styles.boldText}>
                même lorsque l'application est fermée ou que l'écran est
                verrouillé
              </Text>{' '}
              pour vous permettre d'enregistrer vos sessions de ski sans
              interruption.
            </Text>

            <Text style={styles.subtitle}>
              Comment vos données sont utilisées :
            </Text>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>
                  Suivi de votre vitesse de glisse
                </Text>{' '}
                : calcul en temps réel de votre vitesse pendant que vous skiez
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>
                  Mesure de la distance parcourue
                </Text>{' '}
                : enregistrement précis de vos déplacements sur les pistes
              </Text>
            </View>

            <View style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>
                <Text style={styles.boldText}>
                  Sauvegarde de vos performances
                </Text>{' '}
                : création d'un historique de vos sessions pour suivre votre
                progression
              </Text>
            </View>

            <Text style={styles.importantNote}>
              Le suivi continue même lorsque vous verrouillez votre téléphone ou
              utilisez d'autres applications pendant votre session de ski.
            </Text>

            <Text style={styles.privacyNote}>
              Vos données de localisation sont utilisées uniquement pour les
              fonctionnalités décrites ci-dessus et ne sont jamais partagées
              avec des tiers sans votre consentement explicite.
            </Text>
          </ScrollView>

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
    paddingVertical: 14,
  },
  acceptButtonText: {
    ...TextStyles.button,
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  body: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    textAlign: 'left',
  },
  boldText: {
    fontWeight: '700',
  },
  bullet: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bulletText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    elevation: 5,
    maxHeight: '85%',
    maxWidth: 380,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    width: '90%',
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
    paddingVertical: 14,
  },
  denyButtonText: {
    ...TextStyles.button,
    color: Colors.muted,
    fontSize: 16,
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: 16,
    width: 80,
  },
  importantNote: {
    backgroundColor: Colors.lightMuted,
    borderLeftColor: Colors.primary,
    borderLeftWidth: 4,
    borderRadius: 8,
    color: Colors.primaryBorder,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    marginTop: 4,
    padding: 12,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  privacyNote: {
    color: Colors.muted,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 8,
    textAlign: 'left',
  },
  scrollContent: {
    maxHeight: 400,
    width: '100%',
  },
  subtitle: {
    ...TextStyles.h4,
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
  },
  title: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 16,
    textAlign: 'center',
  },
});
