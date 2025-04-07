export async function fetchBrokerConfig(e: Event | null, values?: any, setValue?: any) {
    if (e) {
      e.preventDefault();
    }

    if (!values) {
      return;
    }
    try {
      if (!values?.config?.brokerConfiguration) {
        return;
      }

      // Ensure the URL is valid
      const url = new URL(values?.config?.brokerConfiguration);
      if (!url) {
        return;
      }
      // Fetch the broker configuration
      const res = await fetch('/api/broker-configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.toString() }),
      });

      const data = await res.json();

      // Check if res is ok
      if (!res.ok) {
        throw new Error('Kon broker configuratie niet ophalen');
      }

      // Loop through data, and set the values in the form
      for (const [key, value] of Object.entries(data)) {
        console.log('setting value', key, value);
        if (setValue) {
          setValue(`config.${key}`, value);
        }
      }

      console.log('Broker config data', data);
      return true;
      //toast.success('Broker configuratie is opgehaald');
    } catch (err: any) {
      return false;
    }
  }
