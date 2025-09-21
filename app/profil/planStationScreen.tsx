import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import ImageViewer from "react-native-image-zoom-viewer";
import { Colors } from '@/constants/GraphSettings';
import Header from '../../components/header';
import BoutonRetour from '../../components/divers/boutonRetour';
import BoutonLien from '../../components/divers/boutonLien';
import { Link, Download } from 'lucide-react-native';
import BoutonTelecharger from '@/components/divers/boutonTelecharger';

export default function PlanStation() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const stationImage = require('../../assets/images/plan-station-les-2-alpes-1480.jpg');

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };

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
      <Header />
      <View
        style={{
          width: '100%',
          flex: 1,
          backgroundColor: Colors.white,
          paddingHorizontal: 20,
        }}
      >
        <BoutonRetour previousRoute={"ProfilScreen"} title={"Plan de la station"} />
        <TouchableOpacity
          onPress={toggleModal}
          style={{ height: '80%', justifyContent: 'center', alignItems: 'center' }}
        >
          <Image
            source={stationImage}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={{ position: 'absolute', bottom: 16, left: 20, width: '100%' }}>
          <View style={{ marginBottom: 9 }}>
            <BoutonLien
              url="https://reservation.les2alpes.com/plan-station-2-alpes.html"
              title="Voir la station en ligne"
              IconComponent={Link}
            />
          </View>
          <View>
            <BoutonTelecharger
              url="https://www.les2alpes.com/app/uploads/les-deux-alpes/2022/10/Les-2-Alpes-Plan-de-Station.pdf"
              title="Télécharger le plan"
              IconComponent={Download}
            />
          </View>
        </View>
      </View>

      <ImageViewer
        imageUrls={[{ url: Image.resolveAssetSource(stationImage).uri }]}
        index={0}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 8,
  },
});
