import { useCompare } from "../context/CompareContext";

const CompareProperties = () => {
  const { compareList } = useCompare();

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">
        Compare Properties
      </h1>

      {compareList.length === 0 ? (
        <p>No properties selected</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-white/10">
            <tbody>
              <tr>
                <td className="p-4 font-bold">
                  Property
                </td>

                {compareList.map((property) => (
                  <td
                    key={property._id}
                    className="p-4"
                  >
                    {property.title}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold">
                  Price
                </td>

                {compareList.map((property) => (
                  <td
                    key={property._id}
                    className="p-4"
                  >
                    ₹
                    {property.price.toLocaleString()}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold">
                  Area
                </td>

                {compareList.map((property) => (
                  <td
                    key={property._id}
                    className="p-4"
                  >
                    {property.areaSize}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold">
                  Type
                </td>

                {compareList.map((property) => (
                  <td
                    key={property._id}
                    className="p-4"
                  >
                    {property.propertyType}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold">
                  Views
                </td>

                {compareList.map((property) => (
                  <td
                    key={property._id}
                    className="p-4"
                  >
                    {property.views || 0}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="p-4 font-bold">
                  Favorites
                </td>

                {compareList.map((property) => (
                  <td
                    key={property._id}
                    className="p-4"
                  >
                    {property.favoritesCount || 0}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CompareProperties;