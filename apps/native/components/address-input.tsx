import { useEffect, useState } from "react";
import { View, TextInput, Text, Pressable, Platform } from "react-native";
import * as Location from "expo-location";
import { AddressPickerModal } from "./address-picker-modal";

type Suggestion = {
  id: string;
  label: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  postalCode?: string;
};

export type AddressValue = {
  address: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
};

export function AddressInput({
  value,
  onChange,
  placeholder = "Adresse",
}: {
  value: AddressValue;
  onChange: (next: AddressValue) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState(value.address || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setQuery(value.address || "");
  }, [value.address]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!query || query.length < 3) {
        setSuggestions([]);
        return;
      }
      setLoading(true);
      try {
        if (Platform.OS === 'ios') {
          const results = await Location.geocodeAsync(query);
          const limited = results.slice(0, 5);
          const mapped: Suggestion[] = await Promise.all(
            limited.map(async (r, idx) => {
              try {
                const rev = await Location.reverseGeocodeAsync({ latitude: r.latitude, longitude: r.longitude });
                const first = rev[0];
                const parts = [first?.street, first?.name, first?.postalCode, first?.city].filter(Boolean) as string[];
                return {
                  id: `${r.latitude},${r.longitude}-${idx}`,
                  label: parts.length > 0 ? parts.join(' ') : `${r.latitude}, ${r.longitude}`,
                  latitude: r.latitude,
                  longitude: r.longitude,
                  city: first?.city,
                  postalCode: first?.postalCode,
                } as Suggestion;
              } catch {
                return {
                  id: `${r.latitude},${r.longitude}-${idx}`,
                  label: `${r.latitude}, ${r.longitude}`,
                  latitude: r.latitude,
                  longitude: r.longitude,
                } as Suggestion;
              }
            })
          );
          setSuggestions(mapped);
        } else {
          // Android (oder Fallback): OSM Autocomplete
          const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
            query
          )}&addressdetails=1&limit=5`;
          const res = await fetch(url, {
            headers: { "User-Agent": "SpringEin/1.0 (contact: support@springein.app)" },
          });
          if (res.ok) {
            const data = (await res.json()) as Array<any>;
            const mapped: Suggestion[] = data.map((d: any) => ({
              id: String(d.place_id),
              label: d.display_name,
              latitude: d?.lat ? Number(d.lat) : undefined,
              longitude: d?.lon ? Number(d.lon) : undefined,
              city: d?.address?.city || d?.address?.town || d?.address?.village,
              postalCode: d?.address?.postcode,
            }));
            setSuggestions(mapped);
          } else {
            setSuggestions([]);
          }
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  const selectSuggestion = async (s: Suggestion) => {
    try {
      if (Platform.OS === 'ios') {
        onChange({
          address: s.label,
          city: s.city || value.city,
          postalCode: s.postalCode || value.postalCode,
          latitude: s.latitude ?? value.latitude,
          longitude: s.longitude ?? value.longitude,
        });
        setSuggestions([]);
        return;
      }
      // Fallback/Android: wir haben oft schon Lat/Lng vom Vorschlag; sonst finalisieren über OSM-Detail
      if (s.latitude != null && s.longitude != null) {
        onChange({
          address: s.label,
          city: s.city || value.city,
          postalCode: s.postalCode || value.postalCode,
          latitude: s.latitude,
          longitude: s.longitude,
        });
        setSuggestions([]);
        return;
      }
      const detailsUrl = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        s.label
      )}&addressdetails=1&limit=1`;
      const res = await fetch(detailsUrl, {
        headers: { "User-Agent": "SpringEin/1.0 (contact: support@springein.app)" },
      });
      if (!res.ok) return;
      const [d] = (await res.json()) as Array<any>;
      const addr = d?.address ?? {};
      onChange({
        address: s.label,
        city: addr.city || addr.town || addr.village || value.city,
        postalCode: addr.postcode || value.postalCode,
        latitude: d?.lat ? Number(d.lat) : value.latitude,
        longitude: d?.lon ? Number(d.lon) : value.longitude,
      });
      setSuggestions([]);
    } catch {
      // ignore
    }
  };

  const useCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      const rev = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      const first = rev[0];
      const addressLine = [first?.street, first?.name, first?.postalCode, first?.city]
        .filter(Boolean)
        .join(" ");
      onChange({
        address: addressLine || value.address,
        city: first?.city || value.city,
        postalCode: first?.postalCode || value.postalCode,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setQuery(addressLine || value.address || "");
      setSuggestions([]);
    } catch {
      // ignore
    }
  };

  return (
    <View className="relative mb-1">
      <Pressable onPress={() => setModalOpen(true)}>
        <View pointerEvents="none">
          <TextInput
            placeholder={placeholder}
            value={query}
            editable={false}
            className="border border-gray-300 rounded-lg p-3 bg-gray-50 text-gray-700"
          />
        </View>
      </Pressable>
      <AddressPickerModal
        visible={modalOpen}
        initialQuery={query}
        onClose={() => setModalOpen(false)}
        onPicked={(p) => {
          onChange({
            address: p.address,
            city: p.city ?? value.city,
            postalCode: p.postalCode ?? value.postalCode,
            latitude: p.latitude ?? value.latitude,
            longitude: p.longitude ?? value.longitude,
          });
          setQuery(p.address);
          setModalOpen(false);
        }}
      />
    </View>
  );
}


