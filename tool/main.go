package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"github.com/gocarina/gocsv"
)

type Date string

func (d *Date) String() string {
	return string(*d)
}

func convertDateToTimestamp(date string) (*int64, error) {
	if date == "" {
		return nil, nil
	}
	t, err := time.Parse("20060102", date)
	if err != nil {
		if err.(*time.ParseError).Message == ": day out of range" {
			d, err := strconv.Atoi(date)
			if err != nil {
				return nil, err
			}
			t, err = time.Parse("20060102", fmt.Sprint(d+1))
			if err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}
	// convert t.Unix() to bytes
	ts := t.Unix()
	return &ts, nil
}

type CulturalProperty struct {
	LedgerID                      string `csv:"ledger_id:number" json:"ledger_id,omitempty"`
	ID                            string `csv:"id:number" json:"id,omitempty"`
	Name                          string `csv:"name:string" json:"name,omitempty"`
	Building                      string `csv:"building:string" json:"building,omitempty"`
	Category1                     string `csv:"category1:string" json:"category_1,omitempty"`
	Category2                     string `csv:"category2:string" json:"category_2,omitempty"`
	Category3                     string `csv:"category3:string" json:"category_3,omitempty"`
	Country                       string `csv:"country:string" json:"country,omitempty"`
	Age                           string `csv:"age:string" json:"age,omitempty"`
	ImportantCulturalPropertyDate string `csv:"important_cultural_property_date:string" json:"important_cultural_property_date,omitempty"`
	NationalTreasureDate          string `csv:"national_treasure_date:string" json:"national_treasure_date,omitempty"`
	Prefecture                    string `csv:"prefecture:string" json:"prefecture,omitempty"`
	Address                       string `csv:"address:string" json:"address,omitempty"`
	Storage                       string `csv:"storage:string" json:"storage,omitempty"`
	Owner                         string `csv:"owner:string" json:"owner,omitempty"`
	Administrator                 string `csv:"administrator:string" json:"administrator,omitempty"`
	Latitude                      string `csv:"latitude:string" json:"latitude,omitempty"`
	Longtitude                    string `csv:"longtitude:string" json:"longtitude,omitempty"`
}

type MeiliDocument struct {
	ID                                 string `csv:"id:string" json:"id,omitempty"`
	LedgerID                           string `csv:"ledger_id:number" json:"ledger_id,omitempty"`
	ChildID                            string `csv:"child_id:number" json:"child_id,omitempty"`
	Name                               string `csv:"name:string" json:"name,omitempty"`
	Building                           string `csv:"building:string" json:"building,omitempty"`
	Category1                          string `csv:"category1:string" json:"category_1,omitempty"`
	Category2                          string `csv:"category2:string" json:"category_2,omitempty"`
	Category3                          string `csv:"category3:string" json:"category_3,omitempty"`
	Country                            string `csv:"country:string" json:"country,omitempty"`
	Age                                string `csv:"age:string" json:"age,omitempty"`
	ImportantCulturalPropertyDate      string `csv:"important_cultural_property_date:string" json:"important_cultural_property_date,omitempty"`
	ImportantCulturalPropertyTimestamp *int64 `csv:"important_cultural_property_timestamp:number" json:"important_cultural_property_timestamp,omitempty"`
	NationalTreasureDate               string `csv:"national_treasure_date:string" json:"national_treasure_date,omitempty"`
	NationalTreasureTimestamp          *int64 `csv:"national_treasure_timestamp:number" json:"national_treasure_timestamp,omitempty"`
	Prefecture                         string `csv:"prefecture:string" json:"prefecture,omitempty"`
	Address                            string `csv:"address:string" json:"address,omitempty"`
	Storage                            string `csv:"storage:string" json:"storage,omitempty"`
	Owner                              string `csv:"owner:string" json:"owner,omitempty"`
	Administrator                      string `csv:"administrator:string" json:"administrator,omitempty"`
	GEO                                string `csv:"_geo:string" json:"geo,omitempty"`
	Link                               string `csv:"link:string" json:"link,omitempty"`
}

func main() {
	os.Setenv("TZ", "Asia/Tokyo")
	// read csv used gocsv
	f, err := os.OpenFile("../tmp/list_of_cultural_properties_designated_by_the_Japanese_government.csv", os.O_RDONLY, os.ModePerm)
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
	var items []CulturalProperty
	err = gocsv.UnmarshalFile(f, &items)
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}

	var documents []MeiliDocument
	for i := 0; i < len(items); i++ {
		var d MeiliDocument
		j, err := json.Marshal(items[i])
		if err != nil {
			log.Println(err)
			os.Exit(1)
		}
		err = json.Unmarshal(j, &d)
		if err != nil {
			log.Println(err)
			os.Exit(1)
		}
		if items[i].Latitude != "" && items[i].Longtitude != "" {
			d.GEO = fmt.Sprintf("%s,%s", items[i].Latitude, items[i].Longtitude)
		}
		d.ImportantCulturalPropertyTimestamp, err = convertDateToTimestamp(items[i].ImportantCulturalPropertyDate)
		if err != nil {
			log.Println(err)
			os.Exit(1)
		}
		d.NationalTreasureTimestamp, err = convertDateToTimestamp(items[i].NationalTreasureDate)
		if err != nil {
			log.Println(err)
			os.Exit(1)
		}
		d.Link = "https://kunishitei.bunka.go.jp/heritage/detail/" + d.LedgerID + "/" + d.ID
		d.ChildID = items[i].ID
		d.ID = fmt.Sprintf("%s-%s", d.LedgerID, d.ChildID)
		documents = append(documents, d)

	}
	o, err := os.OpenFile("../tmp/converted.csv", os.O_WRONLY|os.O_CREATE, os.ModePerm)
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
	err = gocsv.MarshalFile(documents, o)
	if err != nil {
		log.Println(err)
		os.Exit(1)
	}
}
