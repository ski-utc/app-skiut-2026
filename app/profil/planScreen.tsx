import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView, Linking, Modal, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import ImageViewer from "react-native-image-zoom-viewer";
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
import Header from '../../components/header';
import BoutonRetour from '../../components/divers/boutonRetour';
import { Link, Download, Webcam, Map, Mountain, MapPin, Navigation, X, Maximize } from 'lucide-react-native';

export default function PlanScreen() {
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const pisteImage = require("../../assets/images/plan-grandvalira.jpg");

  const openStreetMapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=1.7233%2C42.5342%2C1.7433%2C42.5542&layer=mapnik&marker=42.5442%2C1.7333&zoom=17`;

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();
  }, []);

  const toggleImageModal = () => {
    setIsImageModalVisible(!isImageModalVisible);
  };

  const toggleMapModal = () => {
    setIsMapModalVisible(!isMapModalVisible);
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const openMapsApp = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=42.5442,1.7333&query_place_id=ChIJX7_6_6W5pBIRYOz6tQ-8pQs`;
    Linking.openURL(url).catch(err => console.error("Couldn't open maps", err));
  };

  const ActionButton = ({ title, onPress, icon: IconComponent, variant = 'primary' }: {
    title: string;
    onPress: () => void;
    icon: any;
    variant?: 'primary' | 'secondary';
  }) => (
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
        <BoutonRetour previousRoute={"homeNavigator"} title={"Plans"} />
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
              source={pisteImage}
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
          <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Actions</Text>

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
              onPress={() => openLink("https://drive.google.com/uc?export=download&id=1cI9Yvn6tFnepjUYfq9I3yH1uTCmUTGTr")}
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
            imageUrls={[{ url: Image.resolveAssetSource(pisteImage).uri }]}
            index={0}
            backgroundColor="transparent"
            enableSwipeDown={true}
            onSwipeDown={toggleImageModal}
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
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  headerContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 2, height: 3 },
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    ...TextStyles.h3,
    color: Colors.primaryBorder,
    fontWeight: '700',
    marginLeft: 12,
    flex: 1,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlayText: {
    ...TextStyles.small,
    color: Colors.white,
    textAlign: 'center',
    fontWeight: '500',
    marginLeft: 6,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
    marginBottom: 16,
  },
  webMap: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mapOverlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapOverlayText: {
    ...TextStyles.small,
    color: Colors.white,
    marginLeft: 6,
    fontWeight: '500',
  },
  locationInfo: {
    paddingVertical: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    ...TextStyles.body,
    color: Colors.primaryBorder,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationCoords: {
    ...TextStyles.small,
    color: Colors.muted,
    marginBottom: 16,
    marginLeft: 24,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightMuted,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  mapButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mapButtonContent: {
    flex: 1,
  },
  mapButtonTitle: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  mapButtonSubtitle: {
    ...TextStyles.small,
    color: Colors.muted,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionButtonSecondary: {
    borderColor: Colors.primaryBorder,
    backgroundColor: Colors.white,
  },
  actionButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionButtonIconSecondary: {
    backgroundColor: Colors.lightMuted,
  },
  actionButtonText: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  actionButtonTextSecondary: {
    color: Colors.primaryBorder,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBorder,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1000,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenWebView: {
    flex: 1,
    marginTop: 0,
  },
});
