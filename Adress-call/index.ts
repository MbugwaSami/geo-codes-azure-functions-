import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import axios from "axios";

const GCP_API_KEY = process.env["GCP_API_KEY"];
const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

    context.log('HTTP trigger function processed a request.');
    const adresses = req.body && req.body.adresses;

    if (adresses) {
        const locationsPromise = await adresses.map(async (address) => await getLocationCoordinates(address));
        const resolvedLocations = await Promise.all(locationsPromise);
        context.res.status(200).json(
            // status: 200, /* Defaults to 200 */
            resolvedLocations
        );
    }
    else {
        context.res =  {
            status: 400,
            body: "Please pass a adresses in the request body"
        };
    }
};

const getLocationCoordinates = async placeName => {
	const gcpGeolocateUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${placeName}&key=${GCP_API_KEY}`;

	const locationResData = await axios.get(gcpGeolocateUrl);
	try {
		if (!locationResData.data.results[0])
			throw { error: 'please provide valid location' };

		const formattedAddress = locationResData.data.results[0].formatted_address;

		const location = locationResData.data.results[0].geometry.location;
		const latitude = location.lat;
		const longitude = location.lng;

		const coordinates = `${latitude},${longitude}`;
		return { coordinates, formattedAddress };
	} catch (error) {
		return error;
	}
};

export default httpTrigger;
