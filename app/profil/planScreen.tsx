import { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView, Linking, Modal, StatusBar, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { ImageViewer } from "react-native-image-zoom-viewer";
import { Link, Download, Webcam, Map, Mountain, MapPin, Navigation, X, Maximize, LucideIcon } from 'lucide-react-native';

import { Colors, TextStyles } from '@/constants/GraphSettings';
import Header from '@/components/header';
import BoutonRetour from '@/components/divers/boutonRetour';
import stationPlan from '@/assets/images/plan-grandvalira.jpg';
import * as config from '@/constants/api/apiConfig';

type ActionButtonProps = {
  title: string;
  onPress: () => void;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary';
};

export default function PlanScreen() {
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);

  const openStreetMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=1.7233%2C42.5342%2C1.7433%2C42.5542&layer=mapnik&marker=42.5442%2C1.7333&zoom=17`;

  const toggleImageModal = () => setIsImageModalVisible(!isImageModalVisible);
  const toggleMapModal = () => setIsMapModalVisible(!isMapModalVisible);

  const openLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn(`Don't know how to open URL: ${url}`);
      }
    } catch (err) {
      console.error("An error occurred", err);
    }
  };

  const openMapsApp = async () => { // TODO : update with exact position of the station we have
    const latitude = 42.5442;
    const longitude = 1.7333;
    const label = "Pas de la Case";

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`
    });

    if (url) {
      openLink(url);
    }
  };

  const ActionButton = ({ title, onPress, icon: IconComponent, variant = 'primary' }: ActionButtonProps) => (
    <TouchableOpacity
      style={[styles.actionButton, variant === 'secondary' && styles.actionButtonSecondary]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.actionButtonIcon, variant === 'secondary' && styles.actionButtonIconSecondary]}>
        <IconComponent size={20} color={variant === 'primary' ? Colors.primary : Colors.primaryBorder} />
      </View>
      <Text style={[styles.actionButtonText, variant === 'secondary' && styles.actionButtonTextSecondary]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header refreshFunction={null} disableRefresh={true} />

      <View style={styles.headerContainer}>
        <BoutonRetour title={"Plans"} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Mountain size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Plan des Pistes</Text>
          </View>

          <TouchableOpacity
            onPress={toggleImageModal}
            style={styles.imageContainer}
            activeOpacity={0.8}
          >
            <Image
              source={stationPlan}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Maximize size={16} color={Colors.white} />
              <Text style={styles.imageOverlayText}>Appuyez pour agrandir</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Map size={24} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Localisation - Pas de la Case</Text>
          </View>

          <View style={styles.locationInfo}>
            <View style={styles.locationRow}>
              <MapPin size={16} color={Colors.primary} />
              <Text style={styles.locationText}>Pas de la Case, Andorre</Text>
            </View>
            <Text style={styles.locationCoords}>42.5442°N, 1.7333°E</Text>
          </View>

          <View style={styles.mapContainer}>
            <WebView
              source={{ uri: openStreetMapUrl }}
              style={styles.webMap}
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
              renderLoading={() => <View style={styles.loadingMap}><Text>Chargement...</Text></View>}
            />
            <TouchableOpacity style={styles.mapOverlay} onPress={toggleMapModal} activeOpacity={0.8}>
              <View style={styles.mapOverlayContent}>
                <Maximize size={16} color={Colors.white} />
                <Text style={styles.mapOverlayText}>Plein écran</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.mapButton} onPress={openMapsApp} activeOpacity={0.7}>
            <View style={styles.mapButtonIcon}>
              <Navigation size={20} color={Colors.primary} />
            </View>
            <View style={styles.mapButtonContent}>
              <Text style={styles.mapButtonTitle}>Ouvrir dans Maps</Text>
              <Text style={styles.mapButtonSubtitle}>Navigation GPS vers la station</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitleActions}>Actions</Text>

          <View style={styles.actionsContainer}>
            <ActionButton
              title="Voir les pistes en ligne"
              icon={Link}
              onPress={() => openLink("https://www.snowtrex.fr/andorre/pas_de_la_case/meteo.html")}
            />

            <ActionButton
              title="Webcam en live"
              icon={Webcam}
              variant="secondary"
              onPress={() => openLink("https://webtv.feratel.com/webtv/?cam=15056&design=v5&c0=1&c2=0&c4=0&c8=0&c11=0&c34=0&lg=en&pg=1CBFD854-58C3-430D-B207-821354188323&s=0")}
            />

            <ActionButton
              title="Télécharger le plan"
              icon={Download}
              onPress={() => openLink(`${config.BASE_URL}/storage/plan-grandvalira.jpg`)}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isImageModalVisible}
        transparent={false}
        animationType="fade"
        onRequestClose={toggleImageModal}
      >
        <StatusBar hidden />
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={toggleImageModal}
            activeOpacity={0.7}
          >
            <X size={24} color={Colors.white} />
          </TouchableOpacity>

          <ImageViewer
            imageUrls={[{ url: Image.resolveAssetSource(stationPlan).uri }]}
            index={0}
            backgroundColor="transparent"
            enableSwipeDown={true}
            onSwipeDown={toggleImageModal}
            renderIndicator={() => <View />}
          />
        </View>
      </Modal>

      <Modal
        visible={isMapModalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={toggleMapModal}
      >
        <StatusBar hidden />
        <View style={styles.fullScreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={toggleMapModal}
            activeOpacity={0.7}
          >
            <X size={24} color={Colors.white} />
          </TouchableOpacity>

          <WebView
            source={{ uri: openStreetMapUrl }}
            style={styles.fullScreenWebView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButtonIcon: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 16,
    width: 40,
  },
  actionButtonIconSecondary: {
    backgroundColor: Colors.lightMuted,
  },
  actionButtonSecondary: {
    backgroundColor: Colors.white,
    borderColor: Colors.primaryBorder,
  },
  actionButtonText: {
    ...TextStyles.body,
    color: Colors.primary,
    flex: 1,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: Colors.primaryBorder,
  },
  actionsContainer: {
    gap: 12,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    top: 50,
    width: 44,
    zIndex: 1000,
  },
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  fullScreenContainer: {
    backgroundColor: Colors.primaryBorder,
    flex: 1,
    position: 'relative',
  },
  fullScreenWebView: {
    flex: 1,
    marginTop: 0,
  },
  headerContainer: {
    paddingHorizontal: 20,
    width: '100%',
  },
  image: {
    borderRadius: 12,
    height: 200,
    width: '100%',
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imageOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    left: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    right: 0,
  },
  imageOverlayText: {
    ...TextStyles.small,
    color: Colors.white,
    fontWeight: '500',
    marginLeft: 6,
    textAlign: 'center',
  },
  loadingMap: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    flex: 1,
    justifyContent: 'center',
  },
  locationCoords: {
    ...TextStyles.small,
    color: Colors.muted,
    marginBottom: 16,
    marginLeft: 24,
  },
  locationInfo: {
    paddingVertical: 8,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 8,
  },
  locationText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    fontWeight: '600',
    marginLeft: 8,
  },
  mapButton: {
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderColor: Colors.primary,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  mapButtonContent: {
    flex: 1,
  },
  mapButtonIcon: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 16,
    width: 40,
  },
  mapButtonSubtitle: {
    ...TextStyles.small,
    color: Colors.muted,
  },
  mapButtonTitle: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  mapContainer: {
    borderRadius: 12,
    height: 200,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  mapOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
    right: 12,
  },
  mapOverlayContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  mapOverlayText: {
    ...TextStyles.small,
    color: Colors.white,
    fontWeight: '500',
    marginLeft: 6,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  sectionTitle: {
    ...TextStyles.h4Bold,
    color: Colors.primaryBorder,
    flex: 1,
    marginLeft: 12,
  },
  sectionTitleActions: {
    ...TextStyles.h4Bold,
    color: Colors.primaryBorder,
    flex: 1,
    marginBottom: 16,
    marginLeft: 12
  },
  webMap: {
    height: '100%',
    width: '100%',
  },
});
