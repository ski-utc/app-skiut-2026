import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, FlatList } from "react-native";

import { Colors, TextStyles } from '@/constants/GraphSettings';
import { apiGet } from '@/constants/api/apiCalls';
import ErrorScreen from '@/components/pages/errorPage';
import { useUser } from '@/contexts/UserContext';

import BoutonRetour from "../../components/divers/boutonRetour";
import Header from "../../components/header";

type NavettesTabProps = {
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
  cardContainer: {
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
  cardTitle: {
    ...TextStyles.h3Bold,
    color: Colors.primaryBorder,
    marginBottom: 12,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    ...TextStyles.body,
    color: Colors.muted,
    textAlign: 'center',
  },
  innerContainer: {
    flex: 1,
  },
  navetteContainer: {
    alignItems: 'center',
    borderBottomColor: Colors.lightMuted,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 12,
  },
  navetteCouleurText: {
    ...TextStyles.body,
    color: Colors.primary,
    fontWeight: '500',
  },
  navetteDetails: {
    flex: 1,
  },
  navetteIndicator: {
    borderRadius: 2,
    height: '100%',
    marginRight: 12,
    minHeight: 40,
    width: 4,
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
});

export default function NavettesScreen() {
  const [navettesMap, setNavettesMap] = useState<{ [key: string]: any[] }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  const { setUser } = useUser();

  const fetchNavettes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet('navettes');
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
    fetchNavettes();
  }, [fetchNavettes]);

  if (error) {
    return (
      <ErrorScreen error={error} />
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Header refreshFunction={undefined} disableRefresh={true} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.primaryBorder} />
          <Text style={styles.loadingText}>
            Chargement...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header refreshFunction={null} disableRefresh={true} />
      <View style={styles.headerContainer}>
        <BoutonRetour title="Vos Navettes" />
      </View>
      <NavettesTab
        navettesMap={navettesMap}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flex: 1,
  },
  headerContainer: {
    paddingBottom: 8,
    paddingHorizontal: 20,
    width: '100%',
  },
  loadingContent: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.muted,
    marginTop: 16,
    textAlign: 'center',
  },
});
