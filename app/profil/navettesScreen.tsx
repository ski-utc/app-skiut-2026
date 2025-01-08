import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from "react-native";
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
    const [defaultType, setDefaultType] = useState<"aller" | "retour">("aller");

    const { setUser } = useUser();

    const fetchNavettes = async () => {
      setLoading(true);
  
      try {
        const response = await apiGet('getNavettes');
        if (response.success) {
                // Organiser les navettes par type (aller ou retour)
                const map: { [key: string]: any[] } = {
                    aller: [],
                    retour: [],
                };

                response.data.forEach((navette: any) => {
                    const formattedNavette = {
                        ...navette,
                        horaire_depart: navette.horaire_depart,
                        horaire_arrivee: navette.horaire_arrivee,
                    };

                    if (navette.type === 'aller') {
                        map.aller.push(formattedNavette);
                    } else if (navette.type === 'retour') {
                        map.retour.push(formattedNavette);
                    }
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
      }
    };

    useEffect(() => {
        const loadAsyncFonts = async () => {
          await loadFonts();
        };
        loadAsyncFonts();
    
        // Définir le bouton par défaut
        const today = new Date();
        const cutoffDate = new Date("2025-01-22");

        if (today >= cutoffDate) {
            setDefaultType("retour");
        } else {
            setDefaultType("aller");
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

    return (
        <View style={styles.container}>
            <Header refreshFunction={undefined} disableRefresh={undefined} />
            <View style={styles.content}>
                <BoutonRetour previousRoute="ProfilScreen" title="Navettes" />
                <NavettesTab navettesMap={navettesMap} defaultType={defaultType} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    loadingContainer: {
        height: "100%",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start", // Garde le Header en haut
        backgroundColor: Colors.white,
    },
    content: {
        width: '100%',
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
});