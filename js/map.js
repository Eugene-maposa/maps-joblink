let map;
let markers = [];
let infoWindow;
let currentLocationMarker;

// Initialize the map
function initMap() {
    // Center on Bulawayo
    const bulawayo = { lat: -20.1325, lng: 28.6264 };
    
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: bulawayo,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
            {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "on" }]
            }
        ]
    });

    infoWindow = new google.maps.InfoWindow();

    // Add search box
    const input = document.getElementById('location-search');
    const searchBox = new google.maps.places.SearchBox(input);

    map.addListener('bounds_changed', () => {
        searchBox.setBounds(map.getBounds());
    });

    // Handle search results
    searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;

        // Clear existing markers
        markers.forEach(marker => marker.setMap(null));
        markers = [];

        // For each place, get the icon, name and location
        const bounds = new google.maps.LatLngBounds();
        places.forEach(place => {
            if (!place.geometry || !place.geometry.location) return;

            // Create a marker for the place
            addMarker(place.geometry.location, {
                title: place.name,
                type: 'search',
                content: `
                    <div class="info-window">
                        <h3>${place.name}</h3>
                        <p>${place.formatted_address}</p>
                    </div>
                `
            });

            if (place.geometry.viewport) {
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });

    // Get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                // Add marker for user's location
                if (currentLocationMarker) {
                    currentLocationMarker.setMap(null);
                }
                
                currentLocationMarker = new google.maps.Marker({
                    position: pos,
                    map: map,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#4285F4',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeWeight: 2
                    },
                    title: 'Your Location'
                });

                // Add circle to show accuracy
                new google.maps.Circle({
                    map: map,
                    center: pos,
                    radius: position.coords.accuracy,
                    strokeColor: '#4285F4',
                    strokeOpacity: 0.2,
                    strokeWeight: 1,
                    fillColor: '#4285F4',
                    fillOpacity: 0.1
                });

                map.setCenter(pos);
            },
            () => {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    }

    // Add sample job locations (replace with real data from your database)
    addSampleJobLocations();
}

// Add a marker to the map
function addMarker(position, props) {
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: props.title,
        icon: getMarkerIcon(props.type)
    });

    markers.push(marker);

    if (props.content) {
        marker.addListener('click', () => {
            infoWindow.setContent(props.content);
            infoWindow.open(map, marker);
        });
    }

    return marker;
}

// Get marker icon based on type
function getMarkerIcon(type) {
    switch (type) {
        case 'job':
            return {
                url: 'images/job-marker.png', // Add your custom marker image
                scaledSize: new google.maps.Size(30, 30)
            };
        case 'search':
            return null; // Use default marker
        default:
            return null;
    }
}

// Calculate distance between two points
function calculateDistance(point1, point2) {
    return google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(point1),
        new google.maps.LatLng(point2)
    ) / 1000; // Convert to kilometers
}

// Handle geolocation errors
function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? 'Error: The Geolocation service failed.'
            : 'Error: Your browser doesn\'t support geolocation.'
    );
    infoWindow.open(map);
}

// Add sample job locations (replace with real data)
function addSampleJobLocations() {
    const jobLocations = [
        {
            position: { lat: -20.1447, lng: 28.5894 },
            title: 'Software Developer',
            company: 'Tech Solutions Ltd',
            type: 'Full-time'
        },
        {
            position: { lat: -20.1557, lng: 28.5874 },
            title: 'Sales Representative',
            company: 'Retail Corp',
            type: 'Part-time'
        },
        // Add more job locations as needed
    ];

    jobLocations.forEach(job => {
        addMarker(job.position, {
            title: job.title,
            type: 'job',
            content: `
                <div class="info-window job-info">
                    <h3>${job.title}</h3>
                    <p><strong>Company:</strong> ${job.company}</p>
                    <p><strong>Type:</strong> ${job.type}</p>
                    <button onclick="applyForJob('${job.title}')">Apply Now</button>
                </div>
            `
        });
    });
}

// Function to handle job applications
function applyForJob(jobTitle) {
    // Implement your job application logic here
    alert(`Application submitted for: ${jobTitle}`);
} 