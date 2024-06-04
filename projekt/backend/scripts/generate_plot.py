import pandas as pd
import matplotlib.pyplot as plt
import sys

def generate_plot(csv_file, output_file, plot_type):
    df = pd.read_csv(csv_file)
    df['date'] = pd.to_datetime(df['date'])
    
    continents = ['World', 'Europe', 'Asia', 'Africa', 'Oceania', 'North America', 'South America']
    df = df[df['location'].isin(continents)]
    
    plt.figure(figsize=(10, 6))
    for location in df['location'].unique():
        location_data = df[df['location'] == location]
        plt.plot(location_data['date'], location_data[plot_type], label=location)
    
    plt.xlabel('Date')
    plt.ylabel(plot_type.replace('_', ' ').title())
    plt.title(f'COVID-19 {plot_type.replace("_", " ").title()} Over Time by Continent')
    plt.legend()
    plt.grid(True)
    plt.savefig(output_file)

if __name__ == "__main__":
    csv_file = sys.argv[1]
    output_file = sys.argv[2]
    plot_type = sys.argv[3]
    generate_plot(csv_file, output_file, plot_type)
