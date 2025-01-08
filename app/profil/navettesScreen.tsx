import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Colors } from '@/constants/GraphSettings';
import Header from "../../components/header";
import BoutonRetour from "../../components/divers/boutonRetour";
import NavettesTab from "../../components/navettes/navettesTab";
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';

export default function NavettesScreen() {
    const [navettesMap, setNavettesMap] = useState<{ [key: string]: any[] }>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [defaultType, setDefaultType] = useState<"aller" | "retour">("aller");

    const fetchNavettes = async () => {
        setLoading(true);

        try {
            const response = await apiGet('getNavettes'); // Appel à l'API avec apiGet
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
                setError('Une erreur est survenue lors de la récupération des navettes.');
            }
        } catch (err) {
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
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

    if (error !== '') {
        return <ErrorScreen error={error} />;
    }

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Header refreshFunction={undefined} disableRefresh={undefined} />
                <View style={{width: '100%', flex: 1, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center',}}>
                    <ActivityIndicator size="large" color={Colors.gray} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header refreshFunction={fetchNavettes} disableRefresh={undefined} />
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