export type ServiceYear = 2020 | 2021 | 2022;
export type ServiceType = "Photography" | "VideoRecording" | "BlurayPackage" | "TwoDayEvent" | "WeddingSession";

export const updateSelectedServices = (
    previouslySelectedServices: ServiceType[],
    action: { type: "Select" | "Deselect"; service: ServiceType }
) => {
    switch (action.type) {
        case "Select":
            if (action.service == "BlurayPackage" && !previouslySelectedServices.includes("VideoRecording")){
                return previouslySelectedServices;
            }
            if (action.service == "TwoDayEvent" && !previouslySelectedServices.includes("Photography") 
                && !previouslySelectedServices.includes("VideoRecording")){
                return previouslySelectedServices;
            }
            return previouslySelectedServices.filter(service => service !== action.service).concat(action.service);
    
        case "Deselect":
            if (action.service == "VideoRecording") {
                if (!previouslySelectedServices.includes("Photography")){
                    return previouslySelectedServices.filter(service => service !== action.service 
                        && service !== "BlurayPackage" 
                        && service !== "TwoDayEvent");
                }
                return previouslySelectedServices.filter(service => service !== action.service && service !== "BlurayPackage");
            }
            if (action.service == "Photography" && !previouslySelectedServices.includes("VideoRecording")){
                return previouslySelectedServices.filter(service => service !== action.service && service !== "TwoDayEvent");
            }
            return previouslySelectedServices.filter(service => service !== action.service);
    } 
}

export interface ServicePrice {
    basePrice: number;
    finalPrice: number;
}

export const calculatePrice = (selectedServices: ServiceType[], selectedYear: ServiceYear): ServicePrice => {
    let priceList = new PriceListFactory().createPriceList(selectedYear);
    return priceList.getTotalPrice(selectedServices);
}

class PriceList {
    private items: PriceListItem[] = [];
    
    constructor(private year: ServiceYear){
    }

    addItem(newPriceListItem: PriceListItem): this {
        if (this.items.filter(item => item.service == newPriceListItem.service).length > 0){
            throw new Error(`Item for ${newPriceListItem.service} already exists in the price list`);
        }
        this.items.push(newPriceListItem);
        return this;
    }

    getTotalPrice(services: ServiceType[]): ServicePrice {
        let totalPrice = { basePrice: 0, finalPrice: 0 };
        services.forEach(element => {
            let price = this.getServicePrice(element, services);
            totalPrice.basePrice += price.basePrice;
            totalPrice.finalPrice += price.finalPrice;
        });
        return totalPrice;
    }
    
    private getServicePrice(service: ServiceType, otherServices: ServiceType[]): ServicePrice {
        let priceListItem = this.items.filter(item => item.service == service).pop();
        if (priceListItem){
            return priceListItem.calculatePrice(otherServices);
        }
        throw new Error(`No item for ${service} in the price list`);
    }
}

class PriceListItem {
    private relatedServicesDiscount = new Array<[ServiceType, number]>();

    constructor(public service: ServiceType, private price: number){
    }

    withDiscountForAdditionalService(service: ServiceType, discount: number): this {
        this.relatedServicesDiscount.push([service, discount]);
        return this;
    }

    calculatePrice(otherServices: ServiceType[]): ServicePrice {
        let maxDiscount = this.relatedServicesDiscount
            .filter(x => otherServices.includes(x[0]))
            .sort((x, y) => x[1] - y[1])
            .pop();
        if (maxDiscount){
            return { basePrice: this.price, finalPrice: this.price - maxDiscount[1] };
        }
        return { basePrice: this.price, finalPrice: this.price};
    }
}

class PriceListFactory {
    createPriceList(year: ServiceYear): PriceList {
        switch (year) {
            case 2020:
                return new PriceList(2020)
                        .addItem(new PriceListItem("Photography", 1700)
                            .withDiscountForAdditionalService("VideoRecording", 600))
                        .addItem(new PriceListItem("VideoRecording", 1700)
                            .withDiscountForAdditionalService("Photography" , 600))
                        .addItem(new PriceListItem("BlurayPackage", 300))
                        .addItem(new PriceListItem("TwoDayEvent", 400))
                        .addItem(new PriceListItem("WeddingSession", 600)
                            .withDiscountForAdditionalService("Photography" , 300)
                            .withDiscountForAdditionalService("VideoRecording" , 300));
            case 2021:
                return new PriceList(2021)
                    .addItem(new PriceListItem("Photography", 1800)
                        .withDiscountForAdditionalService("VideoRecording", 650))
                    .addItem(new PriceListItem("VideoRecording", 1800)
                        .withDiscountForAdditionalService("Photography" , 650))
                    .addItem(new PriceListItem("BlurayPackage", 300))
                    .addItem(new PriceListItem("TwoDayEvent", 400))
                    .addItem(new PriceListItem("WeddingSession", 600)
                        .withDiscountForAdditionalService("Photography" , 300)
                        .withDiscountForAdditionalService("VideoRecording" , 300));
            case 2022:
                return new PriceList(2022)
                    .addItem(new PriceListItem("Photography", 1900)
                        .withDiscountForAdditionalService("VideoRecording", 650))
                    .addItem(new PriceListItem("VideoRecording", 1900)
                        .withDiscountForAdditionalService("Photography" , 650))
                    .addItem(new PriceListItem("BlurayPackage", 300))
                    .addItem(new PriceListItem("TwoDayEvent", 400))
                    .addItem(new PriceListItem("WeddingSession", 600)
                        .withDiscountForAdditionalService("Photography" , 600)
                        .withDiscountForAdditionalService("VideoRecording" , 300));
        }
    }
}

