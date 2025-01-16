import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import ImageViewing from "react-native-image-viewing";
import { Colors } from '@/constants/GraphSettings';
import Header from '../../components/header';
import BoutonRetour from '../../components/divers/boutonRetour';
import BoutonLien from '../../components/divers/boutonLien';
import { Link, Download } from 'lucide-react-native';
import BoutonTelecharger from '@/components/divers/boutonTelecharger';

export default function PlanStation() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const pisteImage = require("../../assets/images/plan-des-pistes-les-2-alpes-2025.jpg");

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
        <BoutonRetour previousRoute={"ProfilScreen"} title={"Plan des pistes"} />
        <TouchableOpacity
          onPress={toggleModal}
          style={{ height: '80%', justifyContent: 'center', alignItems: 'center' }}
        >
          <Image
            source={pisteImage}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={{ position: 'absolute', bottom: 16, left: 20, width: '100%' }}>
        <View style={{ marginBottom: 9 }}>
            <BoutonLien
                url="https://www.skipass-2alpes.com/fr/plan-des-pistes-live-les2alpes"
                title="Voir les pistes en ligne"
                IconComponent={Link}
            />
        </View>
        <View style={{ marginBottom: 9 }}>
            <BoutonLien
                url="https://www.skipass-2alpes.com/fr/webcams-les-deux-alpes"
                title="Webcam en live"
                IconComponent={Link}
            />
        </View>
        <View>
            <BoutonTelecharger
                url="https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&ved=2ahUKEwiJ6ZbGlt2KAxU3TKQEHZtzCs0QFnoECBsQAQ&url=https%3A%2F%2Fwww.skipass-2alpes.com%2Fmedia%2Fdownload%2Fdalb2c%2Fcms%2Fmedia%2FHIVER%2FPDF%2FPlan_hiver_Les2Alpes_AEON.pdf&usg=AOvVaw1mAs5R8MQp3AT_ME6J_tmP&opi=89978449"
                title="Télécharger le plan"
                IconComponent={Download}
            />
        </View>
        </View>
      </View>

      <ImageViewing
        images={[{ uri: Image.resolveAssetSource(pisteImage).uri }]}
        imageIndex={0}
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
