import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, TouchableOpacity, FlatList } from "react-native";
import { Colors, TextStyles, loadFonts } from '@/constants/GraphSettings';
import Header from "../../components/header";
import BoutonRetour from "../../components/divers/boutonRetour";
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

interface NavettesTabProps {
  navettesMap: { [key: string]: any[] };
}

const NavettesTab: React.FC<NavettesTabProps> = ({ navettesMap }) => {
  const renderNavetteCard = (type: "Aller" | "Retour", navettes: any[]) => (
    <View style={navettesStyles.cardContainer}>
      <Text style={navettesStyles.cardTitle}>{type}</Text>
      {navettes.length > 0 ? (
        <FlatList
          data={navettes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={navettesStyles.navetteContainer}>
              <View style={[navettesStyles.navetteIndicator, { backgroundColor: item.colour || Colors.primaryBorder }]} />
              <View style={navettesStyles.navetteDetails}>
                <Text style={navettesStyles.navetteText}>
                  {item.departure} → {item.arrival}
                </Text>
                <Text style={navettesStyles.navetteTimeText}>
                  {item.horaire_depart} - {item.horaire_arrivee}
                </Text>
                <Text style={navettesStyles.navetteCouleurText}>
                  Navette {item.colourName}
                </Text>
              </View>
            </View>
          )}
          scrollEnabled={false}
        />
      ) : (
        <View style={navettesStyles.emptyContainer}>
          <Text style={navettesStyles.emptyText}>
            Aucune navette {type.toLowerCase()} disponible.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={navettesStyles.container}>
      <View style={navettesStyles.innerContainer}>
        {renderNavetteCard("Aller", navettesMap['Aller'] || [])}
        {renderNavetteCard("Retour", navettesMap['Retour'] || [])}
      </View>
    </View>
  );
};

const navettesStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  innerContainer: {
    flex: 1,
  },
  cardContainer: {
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
  cardTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 12,
    textAlign: 'center',
  },
  navetteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightMuted,
  },
  navetteIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 12,
    minHeight: 40,
  },
  navetteDetails: {
    flex: 1,
  },
  navetteText: {
    ...TextStyles.h4,
    color: Colors.primaryBorder,
    fontWeight: '600',
    marginBottom: 4,
  },
  navetteTimeText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginBottom: 2,
  },
  navetteCouleurText: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
  },
});

export default function NavettesScreen() {
  const [navettesMap, setNavettesMap] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const { setUser } = useUser();

  const fetchNavettes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet('getNavettes');
      console.log(response.data);
      if (response.success) {
        const map: { [key: string]: any[] } = {
          Aller: [],
          Retour: [],
        };

        Object.keys(response.data).forEach((type: string) => {
          response.data[type].forEach((navette: any) => {
            const formattedNavette = {
              ...navette,
              horaire_depart: navette.horaire_depart,
              horaire_arrivee: navette.horaire_arrivee,
            };
            if (map[type]) {
              map[type].push(formattedNavette);
            }
          });
        });

        setNavettesMap(map);
      } else {
        setError(response.message);
      }
    } catch (error: any) {
      if (error.message === 'NoRefreshTokenError' || error.JWT_ERROR) {
        setUser(null);
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    const loadAsyncFonts = async () => {
      await loadFonts();
    };
    loadAsyncFonts();

    fetchNavettes();
  }, [fetchNavettes]);

  if (error) {
    return (
      <ErrorScreen error={error} />
    );
  }

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: Colors.white,
      }}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={{
          width: '100%',
          flex: 1,
          backgroundColor: Colors.white,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={[TextStyles.body, { color: Colors.muted, marginTop: 16 }]}>
            Chargement...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header refreshFunction={null} disableRefresh={null} />
      <View style={styles.headerContainer}>
        <BoutonRetour previousRoute="homeNavigator" title="Vos Navettes" />
      </View>
      <NavettesTab
        navettesMap={navettesMap}
      />
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
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
});
