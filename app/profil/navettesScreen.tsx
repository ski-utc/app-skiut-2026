import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { Colors, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import BoutonRetour from "../../components/divers/boutonRetour";
import NavettesTab from "../../components/navettes/navettesTab";
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

export default function NavettesScreen() {
  const [navettesMap, setNavettesMap] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [defaultType, setDefaultType] = useState<"Aller" | "Retour">("Aller");
  const [disableRefresh, setDisableRefresh] = useState(false);

  const { setUser } = useUser();

  const fetchNavettes = async () => {
    setLoading(true);
    setDisableRefresh(true);
    try {
      const response = await apiGet('getNavettes');
      if (response.success) {
        const map = {
          Aller: [],
          Retour: [],
        };

        Object.keys(response.data).forEach((type) => {
          response.data[type].forEach((navette) => {
            const formattedNavette = {
              ...navette,
              horaire_depart: navette.horaire_depart,
              horaire_arrivee: navette.horaire_arrivee,
            };
            map[type].push(formattedNavette);
          });
        });

        setNavettesMap(map);
      } else {
        setError(response.message);
      }
    } catch (error) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
      setTimeout(() => {
        setDisableRefresh(false);
      }, 5000);
    }
  };

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

    const today = new Date();
    const cutoffDate = new Date("2025-01-22");

    if (today >= cutoffDate) {
      setDefaultType("Retour");
    } else {
      setDefaultType("Aller");
    }

    fetchNavettes();
  }, []);

  if (error != '') {
    return <ErrorScreen error={error} />;
  }

  if (loading) {
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Header />
        <View
          style={{
            width: '100%',
            flex: 1,
            backgroundColor: Colors.white,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color={Colors.gray} />
        </View>
      </View>
    );
  }

  // Check if the navettes map for the selected type is empty
  const isAllerEmpty = navettesMap['Aller'].length === 0;
  const isRetourEmpty = navettesMap['Retour'].length === 0;

  return (
    <View style={styles.container}>
      <Header refreshFunction={fetchNavettes} disableRefresh={disableRefresh} />
      <View style={styles.content}>
        <BoutonRetour previousRoute="ProfilScreen" title="Navettes" />
        <NavettesTab
          navettesMap={navettesMap}
          defaultType={defaultType}
          isAllerEmpty={isAllerEmpty}
          isRetourEmpty={isRetourEmpty}
        />

        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  content: {
    width: '100%',
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    color: Colors.black,
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: 20,
  }
});
