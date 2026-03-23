/* eslint-disable @typescript-eslint/no-namespace */

declare namespace kakao.maps {
  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class Map {
    constructor(container: HTMLElement, options: { center: LatLng; level: number });
    setCenter(latlng: LatLng): void;
    setLevel(level: number): void;
    getLevel(): number;
    setBounds(bounds: LatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number): void;
  }

  class Marker {
    constructor(options: { position: LatLng; map?: Map; image?: MarkerImage });
    setMap(map: Map | null): void;
    getPosition(): LatLng;
  }

  class MarkerImage {
    constructor(src: string, size: Size, options?: { offset?: Point });
  }

  class InfoWindow {
    constructor(options: { content: string; removable?: boolean });
    open(map: Map, marker: Marker): void;
    close(): void;
  }

  class LatLngBounds {
    constructor();
    extend(latlng: LatLng): void;
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  class CustomOverlay {
    constructor(options: { content: string | HTMLElement; position: LatLng; map?: Map; yAnchor?: number; xAnchor?: number });
    setMap(map: Map | null): void;
  }

  namespace event {
    function addListener(target: Marker | Map, type: string, handler: () => void): void;
  }

  namespace services {
    class Geocoder {
      addressSearch(address: string, callback: (result: Array<{ x: string; y: string; address_name: string }>, status: string) => void): void;
    }

    const Status: {
      OK: string;
      ZERO_RESULT: string;
      ERROR: string;
    };
  }

  function load(callback: () => void): void;
}

interface Window {
  kakao: typeof kakao;
}
